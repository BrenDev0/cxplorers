import { NotFoundError } from "../../../core/errors/errors";
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';
import { GoogleError } from "../google.errors";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Container from "../../../core/dependencies/Container";
import EventsService from "../../calendars/events/EventsService";
import { Event, GoogleEvent } from "../../calendars/events/events.interface";
import AppError from "../../../core/errors/AppError";
import EncryptionService from "../../../core/services/EncryptionService";
import { CalendarData } from "../../calendars/calendars.interface";
import EventAttendeesService from "../../calendars/eventAtendees/EventAttendeesService";
import { GoogleAttendee } from "../../calendars/eventAtendees/eventAttendees.interface";
import ContactService from "../../contacts/ContactsService";

export interface notificationResult {
    watchId: string;
    resourceId: string;
    expiration: string;
}

export default class GoogleCalendarService {
    private readonly block = "google.services.calendar";

    async listCalendars(oauth2Client: OAuth2Client) {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client});

        const res = await calendar.calendarList.list();
        
        const calendars = res.data.items
        
        if (!calendars || calendars.length === 0) {
            throw new NotFoundError("no calendars found in google drive")
        }

        return calendars.filter((calendar) => calendar.accessRole === 'owner');
    }

    async updateCalendar(oauth2Client: OAuth2Client, calendarReferenceId: string, calendarId: string, businessId: string) {
        const block = `${this.block}.updateCalendar`
        try {
            const events = await this.listEvents(oauth2Client, calendarReferenceId) as GoogleEvent[]
            
            const mappedEvents = events.length !== 0 ? events.map((event) => {
                return {
                    ...event,
                    calendarId: calendarId
                }
            }) : []
            
            const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
            const existingEvents = events.length !== 0 ? events.map((event) => encryptionService.encryptData(event.id)) : [];

            const eventsService = Container.resolve<EventsService>("EventsService");
            const [updatedEvents, deletedEvents] = await Promise.all([
                mappedEvents.length !== 0 && eventsService.upsert(mappedEvents),
                existingEvents.length === 0 ? eventsService.delete("calendar_id", calendarId) : eventsService.deleteNonExistingEvents(existingEvents)
            ])
            
            const eventAttendeesService = Container.resolve<EventAttendeesService>("EventAttendeesService")
            const eventAttendees: GoogleAttendee[] = []

            if(updatedEvents){
                const contactsService = Container.resolve<ContactService>("ContactsService");
                const contacts = await contactsService.collection(businessId);
                const contactsMap = new Map(
                    contacts.map((contact) =>  [contact.email, contact.contactId])
                )

                for(const eventInDb of updatedEvents) {
                    const eventFromGoogle = events.find((i) => i.id === encryptionService.decryptData(eventInDb.event_reference_id));

                    if(eventFromGoogle) {
                        const inDbAttending = await eventAttendeesService.collection("event_id", eventInDb.event_id)
                        const updatedAttending = eventFromGoogle.attendees.map((attendee) => contactsMap.get(attendee.email));
                        const attendeesToDelete = inDbAttending.filter((attendee) =>  !updatedAttending.includes(attendee.contactId))

                        if(attendeesToDelete.length !== 0) {
                            for(const attendee of attendeesToDelete) {
                                await eventAttendeesService.deleteOne(attendee.contactId, eventInDb.event_id)
                            }
                        }
                  
                        for(const attendee of eventFromGoogle.attendees) {
                            eventAttendees.push({
                                eventId: eventInDb.event_id,
                                email: attendee.email,
                                status: attendee.responseStatus,
                                source: "GOOGLE",
                                businessId: businessId
                            })
                        }
                    }

                }
            }
           
           eventAttendees.length !== 0 && await eventAttendeesService.handleAttendees(eventAttendees as GoogleAttendee[])

            return;
        } catch (error) {
             throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }

    }

    async requestCalendarNotifications(calendarReferenceId: string, oauth2Client: OAuth2Client): Promise<notificationResult> {
        const block = `${this.block}.requesNotifications`
        try {
            const watchId = uuidv4();
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            
            const response = await calendar.events.watch({
                calendarId: calendarReferenceId,
                requestBody: {
                    id: watchId,
                    type: 'web_hook',
                    address: `https://${process.env.HOST}/google/calendars/notifications`,
                    params: {
                        ttl: '7776000' 
                    }
                }
            })

            if(!response || !response.data) {
                throw new GoogleError("No response recieved from google");
            }

            const { resourceId, expiration } = response.data;

            if (!resourceId || !expiration) {
                throw new GoogleError('Missing resourceId or expiration from Google response');
            }
            
            const experationDate = new Date(Number(expiration));
            console.log("experiration:::", expiration, "experationDate:::: ", experationDate);
            return {
                watchId,
                resourceId,
                expiration: experationDate.toISOString()
            };
        } catch (error) {
            console.log(error);
            if(error instanceof AppError) {
                throw error;
            }

            throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

    async CancelCalendarNotifications(channelResourceId: string, channelId: string, oauth2Client: OAuth2Client) {
        const block = `${this.block}.cancelCalendarNotifications`
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            await calendar.channels.stop({
                requestBody: {
                id: channelId,
                resourceId: channelResourceId,
                },
            });
            
            console.log('Channel stopped successfully');
            return;
        } catch (error) {
            throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

    // events //
    async listEvents(oauth2Client: OAuth2Client, calendarReferenceId: string): Promise<unknown> {
        const block = `${this.block}.listEvents`
    
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const res = await calendar.events.list({
                calendarId: calendarReferenceId
            })
            
            const events = res.data.items
        
            return events || [];
        } catch (error) {
            throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

    async addEvent(oauth2Client: OAuth2Client, calendarReferenceId: string, event: Record<string, any>) {
        const block = `${this.block}.addEvent`
        try {
           const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const response = await calendar.events.insert({
                calendarId: calendarReferenceId,
                requestBody: event
            })

            return;
        } catch (error) {
            throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

    async updateEvent(oauth2Client: OAuth2Client, calendarReferenceId: string, eventReferenceId: string, eventUpdates: Record<string, any>) {
        const block = `${this.block}.updateEvent`
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const response = calendar.events.patch({
                calendarId: calendarReferenceId,
                eventId: eventReferenceId,
                requestBody: eventUpdates
            })

            return;
        } catch (error) {
             throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

    async deleteEvent(oauth2Client: OAuth2Client, calendarReferenceId: string, eventId: string) {
        const block = `${this.block}.deleteEvent`;
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const response = calendar.events.delete({
                calendarId: calendarReferenceId,
                eventId: eventId
            })

            return;
        } catch (error) {
           throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

}