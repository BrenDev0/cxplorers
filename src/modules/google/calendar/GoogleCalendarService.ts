import { NotFoundError } from "../../../core/errors/errors";
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';
import { GoogleError } from "../google.errors";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Container from "../../../core/dependencies/Container";
import EventsService from "../../events/EventsService";
import { GoogleEvent } from "../../events/events.interface";
import AppError from "../../../core/errors/AppError";

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

    async updateCalendar(calnedarId: string, events: GoogleEvent[]) {
        const block = `${this.block}.updateCalendar`
        try {
            const eventsService = Container.resolve<EventsService>("EventsService");
            const mappedEvents = events.map((event) => {
                return {
                    ...event,
                    calendarId: calnedarId
                }
            })

            const existingEvents = events.map((event) => event.id);

            await Promise.all([
                eventsService.upsert(mappedEvents),
                existingEvents.length === 0 ? eventsService.delete("calendar_id", calnedarId) : eventsService.deleteNonExistingEvents(existingEvents)
            ])

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
                        ttl: '86400' // Optional: time in seconds (1 day)
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
            console.log(error, "::::::::::::")
           throw  new GoogleError();
        }
    }

    // events //
    async listEvents(calendarReferenceId: string, oauth2Client: OAuth2Client) {
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

    async addEvent(calendarReferenceId: string, accessToken: string, event: any) {
        const block = `${this.block}.addEvent`
        try {
            const calendar = google.calendar({ version: 'v3' });

            const response = calendar.events.insert({
                auth: accessToken,
                calendarId: calendarReferenceId,
                requestBody: event
            })
        } catch (error) {
            throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

}