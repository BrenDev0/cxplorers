import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../../../core/errors/errors";
import Container from "../../../core/dependencies/Container";
import GoogleService from "../GoogleService";
import HttpService from "../../../core/services/HttpService";
import CalendarsService from "../../calendars/CalendarsService";
import { CalendarData } from "../../calendars/calendars.interface";
import EventsService from "../../events/EventsService";
import { GoogleError } from "../google.errors";

export default class GoogleCalendarController {
    private readonly block = "google.controller";
    private httpService: HttpService;
    private googleService: GoogleService; 
    private platformCalendarService: CalendarsService;
   
    constructor(httpService: HttpService , googleService: GoogleService, platformCalendarService: CalendarsService) {
        this.httpService = httpService
        this.googleService = googleService,
        this.platformCalendarService = platformCalendarService
    }

    async handleCalendarNotifications(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.handleNotifications`;
        try {
            const headers = req.headers;
          
            const channelId = headers['x-goog-channel-id'] as string;

            if(!channelId) {
                res.status(200).send();
                return;
            }

            const encryptedChannelId = this.httpService.encryptionService.encryptData(channelId) 
            const resource = await this.platformCalendarService.findByChannel(encryptedChannelId);
            if(!resource) {
                res.status(404).send();
                return;
            };

            if(!resource.calendarReferenceId) {
                throw new GoogleError("Googlecalendar configuration error", {
                    block: `${this.block}.calendarReferenceIdCheck`,
                    resource: resource
                })
            }

            const client = await this.googleService.clientManager.getcredentialedClient(resource.userId);


            await this.googleService.calendarService.updateCalendar(client, resource.calendarReferenceId, resource.calendarId!);

            res.status(200).send();
        } catch (error) {
            throw error;
        }
    }

    async syncCalendar(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.syncCalendar`
        try {
            const calendarId = req.params.calendarId;
            
            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

            const resource = await this.platformCalendarService.resource(calendarId);
            if(!resource) {
                throw new NotFoundError(undefined, {
                    calendarId,
                    resource: resource || "Calendar not found"
                })
            }

            const client = await this.googleService.clientManager.getcredentialedClient(resource.userId);

            const result = await this.googleService.calendarService.requestCalendarNotifications(resource.calendarReferenceId, client);
            const changes = {
                watchChannel: result.watchId,
                watchChannelResourceId: result.resourceId,
                channelExpiration: result.expiration
            }
           
            await this.platformCalendarService.update(resource.calendarId!, changes as CalendarData);
            await this.googleService.calendarService.updateCalendar(client, resource.calendarReferenceId, resource.calendarId!);
            
            res.status(200).json({ message: "calendar synced"})
        } catch (error) {
            throw error;
        }
    }

    async unSyncCalendar(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.syncCalendar`
        try {
            const calendarId = req.params.calendarId;
            
            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

            const resource = await this.platformCalendarService.resource(calendarId);
            if(!resource) {
                throw new NotFoundError(undefined, {
                    calendarId,
                    resource: resource || "Calendar not found"
                })
            }

            if(!resource.watchChannel || !resource.watchChannelResourceId) {
                throw new BadRequestError("Calendar is not synced", {
                    resource
                })
            }

            const client = await this.googleService.clientManager.getcredentialedClient(resource.userId);
          
            await this.googleService.calendarService.CancelCalendarNotifications(resource.watchChannelResourceId, resource.watchChannel, client);
            const changes =  {
                watchChannel: null,
                watchChannelResourceId: null,
                channelExpiration: null
            }
            await this.platformCalendarService.update(resource.calendarId!, changes as CalendarData);
            res.status(200).json({ message: "calendar unsynced"})
        } catch (error) {
            console.log("ERRROR uncsync:::::::::", error)
            throw error;
        }
    }

    async getCalendars(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            const client = await this.googleService.clientManager.getcredentialedClient(user.user_id);

            const calendars = await this.googleService.calendarService.listCalendars(client);

            res.status(200).json({ data: calendars })
        } catch (error) {
            throw error 
        }
    }

    async getCalendarEvents(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.getCalendarEvents`
        try {
            const user = req.user;
            const calendarId = req.params.calendarId;
            const client = await this.googleService.clientManager.getcredentialedClient(user.user_id);

            this.httpService.requestValidation.validateUuid(calendarId, "calenderId", block);
       
            const resource = await this.platformCalendarService.resource(calendarId);
           
            if(!resource) {
                throw new NotFoundError();
            }

            const data = await this.googleService.calendarService.listEvents(client, resource.calendarReferenceId);
            res.status(200).json({ data: data })
        } catch (error) {
            throw error;
        }
    } 

    async createEvent(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.createEvent`
        try {
            const user = req.user;
            const calendarId = req.params.calendarId;
            const requiredFields = ["start", "end", "summary"];
            
            const event = {
                ...req.body,
                start: {
                    dateTime: req.body.start
                },
                end: {
                    dateTime: req.body.end
                }
            }
            
            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
            this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
            
            const calendar = await this.platformCalendarService.resource(calendarId);
            
            if(!calendar) {
                throw new NotFoundError(undefined, {
                    block: `${block}.calendarExistsCheck`,
                    calendar: calendar || `No calendar found in db with id: ${calendarId}` 
                });
            };

            const client = await this.googleService.clientManager.getcredentialedClient(user.user_id);

            await this.googleService.calendarService.addEvent(client, calendar.calendarReferenceId, event);
            await this.googleService.calendarService.updateCalendar(client, calendar.calendarReferenceId, calendar.calendarId!)

            res.status(200).json({ message: "Event added"})
        } catch (error) {
            throw error;
        }
    }

    async deleteEvent(req: Request, res: Response): Promise<void> {
        const block =  `${this.block}.deleteEvent`;
        try {
            const user = req.user;
            const eventId = req.params.eventId;

            this.httpService.requestValidation.validateUuid(eventId, "eventId", block);

            const eventService = Container.resolve<EventsService>("EventsService");
            const resource = await eventService.resource(eventId);
            if(!resource) {
                throw new NotFoundError(undefined, {
                    block: `${block}.eventExistsCheck`,
                    rescource: resource || `No event found in db with id: ${eventId}` 
                });
            }

            if(!resource.calendarReferenceId) {
                throw new GoogleError("Calendar configuration error", {
                    block: `${block}.calendarReferenceCheck`,
                    rescource: resource  
                });
            }

            const client = await this.googleService.clientManager.getcredentialedClient(user.user_id);

            await this.googleService.calendarService.deleteEvent(client, resource.calendarReferenceId, resource.eventReferenceId);
            await this.googleService.calendarService.updateCalendar(client, resource.calendarReferenceId, resource.calendarId);

            res.status(200).json({ message: "Event deleted"})
        } catch (error) {
            throw error;
        }
    }
}

   