import { Request, Response } from "express";
import { AuthorizationError, BadRequestError, NotFoundError } from "../../../core/errors/errors";
import Container from "../../../core/dependencies/Container";
import GoogleService from "../GoogleService";
import HttpService from "../../../core/services/HttpService";
import CalendarsService from "../../calendars/CalendarsService";
import { CalendarData } from "../../calendars/calendars.interface";
import EventsService from "../../calendars/events/EventsService";
import { GoogleError } from "../google.errors";
import { EventData } from "../../calendars/events/events.interface";

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

            const client = await this.googleService.clientManager.getcredentialedClient(resource.businessId);


            await this.googleService.calendarService.updateCalendar(client, resource.calendarReferenceId, resource.calendarId!, resource.businessId);

            res.status(200).send();
        } catch (error) {
            throw error;
        }
    }

    async syncCalendar(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.syncCalendar`
        try {
            const user = req.user;
            const businessId = req.businessId;
            const calendarId = req.params.calendarId;
            
            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

            const calendarResource = await this.httpService.requestValidation.validateResource<CalendarData>(calendarId, "CalendarsService", "Calendar not found", block);
            this.httpService.requestValidation.validateActionAuthorization(businessId, calendarResource.businessId, block);

            const client = await this.googleService.clientManager.getcredentialedClient(user.user_id);

            const result = await this.googleService.calendarService.requestCalendarNotifications(calendarResource.calendarReferenceId, client);
            const changes = {
                watchChannel: result.watchId,
                watchChannelResourceId: result.resourceId,
                channelExpiration: result.expiration
            }
           
            await this.platformCalendarService.update(calendarResource.calendarId!, changes as CalendarData);
            await this.googleService.calendarService.updateCalendar(client, calendarResource.calendarReferenceId, calendarResource.calendarId!, businessId);
            
            res.status(200).json({ message: "calendar synced"})
        } catch (error) {
            throw error;
        }
    }

    async unSyncCalendar(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.syncCalendar`
        try {
            const user = req.user;
            const businessId = req.businessId;
            const calendarId = req.params.calendarId;
            
            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

            const resource = await this.httpService.requestValidation.validateResource<CalendarData>(calendarId, "CalendarsService", "Calendar not found", block);
            this.httpService.requestValidation.validateActionAuthorization(businessId, resource.businessId, block);
            
            if(!resource.watchChannel || !resource.watchChannelResourceId) {
                throw new BadRequestError("Calendar is not synced", {
                    resource
                })
            }

            const client = await this.googleService.clientManager.getcredentialedClient(businessId);
          
            await this.googleService.calendarService.CancelCalendarNotifications(resource.watchChannelResourceId, resource.watchChannel, client);
            const changes =  {
                watchChannel: null,
                watchChannelResourceId: null,
                channelExpiration: null
            }
            await this.platformCalendarService.update(resource.calendarId!, changes as CalendarData);
            res.status(200).json({ message: "calendar unsynced"})
        } catch (error) {
            throw error;
        }
    }

    async getCalendars(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            const businessId = req.businessId;
            const client = await this.googleService.clientManager.getcredentialedClient(businessId);

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
       
            const resource = await this.httpService.requestValidation.validateResource<CalendarData>(calendarId, "CalendarsService", "Calendar not found", block);

            const data = await this.googleService.calendarService.listEvents(client, resource.calendarReferenceId);
            res.status(200).json({ data: data })
        } catch (error) {
            throw error;
        }
    } 

    async createEventRequest(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.createEventRequest`
        try {
            const user = req.user;
            const businessUserId = req.businessUserId;
            const businessId = req.businessId;
            const calendarId = req.params.calendarId;
            const requiredFields = ["startTime", "endTime", "summary"];

            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
            this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
            
            const calendar = await this.httpService.requestValidation.validateResource<CalendarData>(calendarId, "CalendarsService", "Calendar not found", block);
            this.httpService.requestValidation.validateActionAuthorization(businessId, calendar.businessId, block);
            
            // https://developers.google.com/workspace/calendar/api/v3/reference/events/insert  reference for parameters
            const event = {
                ...req.body,
                start: {
                    dateTime: req.body.startTime
                },
                end: {
                    dateTime: req.body.endTime
                },
                sendUpdates: "all"
            }
            
            
            const client = await this.googleService.clientManager.getcredentialedClient(businessId);

            await this.googleService.calendarService.addEvent(client, calendar.calendarReferenceId, event);
            await this.googleService.calendarService.updateCalendar(client, calendar.calendarReferenceId, calendar.calendarId!, businessId)

            res.status(200).json({ message: "Event added"})
        } catch (error) {
            throw error;
        }
    }

    async updateEventRequest(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.updateEventRequest`
        try {
            const user = req.user;
            const businessId = req.businessId;
            const eventId = req.params.eventId;

            this.httpService.requestValidation.validateUuid(eventId, "eventId", block);

            const eventResource = await this.httpService.requestValidation.validateResource<EventData>(eventId, "EventsService", "Event not found", block);

            if(!eventResource.calendarReferenceId) {
                throw new GoogleError("Calendar configuration error", {
                    block: `${block}.calendarReferenceCheck`,
                    rescource: eventResource  
                });
            }

            const eventUpdates = {
                ...req.body,
                start: {
                    dateTime: req.body.startTime
                },
                end: {
                    dateTime: req.body.endTime
                },
                sendUpdates: "all"
            }

            const client = await this.googleService.clientManager.getcredentialedClient(businessId);

            await this.googleService.calendarService.updateEvent(client, eventResource.calendarReferenceId, eventResource.eventReferenceId, eventUpdates);
            await this.googleService.calendarService.updateCalendar(client, eventResource.calendarReferenceId, eventResource.calendarId, businessId);

            res.status(200).json({ message: "Event deleted"})
        } catch (error) {
            throw error;
        }
    }

    async deleteEventRequest(req: Request, res: Response): Promise<void> {
        const block =  `${this.block}.deleteEventRequest`;
        try {
            const user = req.user;
            const businessId = req.businessId;
            const eventId = req.params.eventId;

            this.httpService.requestValidation.validateUuid(eventId, "eventId", block);

            const eventResource = await this.httpService.requestValidation.validateResource<EventData>(eventId, "EventsService", "Event not found", block);

            if(!eventResource.calendarReferenceId) {
                throw new GoogleError("Calendar configuration error", {
                    block: `${block}.calendarReferenceCheck`,
                    rescource: eventResource  
                });
            }

            if(!eventResource.calendarReferenceId) {
                throw new GoogleError("Calendar configuration error", {
                    block: `${block}.calendarReferenceCheck`,
                    rescource: eventResource  
                });
            }

            const client = await this.googleService.clientManager.getcredentialedClient(businessId);

            await this.googleService.calendarService.deleteEvent(client, eventResource.calendarReferenceId, eventResource.eventReferenceId);
            await this.googleService.calendarService.updateCalendar(client, eventResource.calendarReferenceId, eventResource.calendarId, businessId);

            res.status(200).json({ message: "Event deleted"})
        } catch (error) {
            throw error;
        }
    }
}

   