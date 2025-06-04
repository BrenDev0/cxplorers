import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../../core/errors/errors";
import { RedisClientType } from "redis";
import Container from "../../core/dependencies/Container";
import GoogleService from "./GoogleService";
import EncryptionService from "../../core/services/EncryptionService";
import { OAuth2Client } from "google-auth-library";
import { GoogleUser } from "./google.interface";
import HttpService from "../../core/services/HttpService";
import CalendarsService from "../calendars/CalendarsService";
import { CalendarData } from "../calendars/calendars.interface";
import { GoogleEvent } from "../events/events.interface";

export default class GoogleController {
    private readonly block = "google.controller";
    private httpService: HttpService;
    private client: OAuth2Client
    private googleService: GoogleService; 
    private readonly filterOptions = {
        SHEET: "sheet",
        FOLDER: "folder"
    }
    constructor(httpService: HttpService , client: OAuth2Client, googleService: GoogleService) {
        this.httpService = httpService
        this.client = client;
        this.googleService = googleService
    }

    async callback(req: Request, res: Response): Promise<void> {
        const { code, state } = req.query;

        if (!code || !state) {
            throw new BadRequestError('Missing code or state');
        }

        const redisClient = Container.resolve<RedisClientType>("RedisClient");
        const session = await redisClient.get(`oauth_state:${state}`);
        if (!session) {
            throw new BadRequestError('Invalid or expired state');
        };

        // Exchange authorization code for access token
        const { tokens } = await this.client.getToken(code as string);
        this.client.setCredentials(tokens);

        if(!tokens.refresh_token) {
            throw new BadRequestError("Google authorization failed");
        }
        
        const encryptionService: EncryptionService = Container.resolve("EncryptionService");
        const sessionData = {
          refreshToken: encryptionService.encryptData(tokens.refresh_token),
    
        }

        console.log(tokens)

        await redisClient.setEx(`oauth_state:${state}`, 900, JSON.stringify(sessionData))
       
        
        res.redirect(`https://broker-app-pearl.vercel.app/account/create/${state}`);
    }

    async getUrl(req: Request, res: Response): Promise<void> {
        try {
            const url = this.googleService.getUrl(this.client);

            res.status(200).json({
                url: url
            })
        } catch (error) {
            throw error;
        }
    }

    async credentializeClient(userId: string): Promise<GoogleUser> {
    
      const user = await this.googleService.getUser(userId)
      
      this.client.setCredentials({
          refresh_token: user.refresh_token
      })

      const accessToken = await this.googleService.refreshAccessToken(this.client);

      this.client.setCredentials({
          access_token: accessToken
      })
      return user;
   } 


   //calendar //
    async handleCalendarNotifications(req: Request, res: Response): Promise<void> {
        try {
            const headers = req.headers;
            const calendarsService = Container.resolve<CalendarsService>("CalendarsService");
            const channelId = headers['x-goog-channel-id'] as string;

            if(!channelId) {
                res.status(200).send();
                return;
            }

            const encryptedChannelId = this.httpService.encryptionService.encryptData(channelId) 
            const resource = await calendarsService.findByChannel(encryptedChannelId);
            if(!resource) {
                res.status(404).send();
                return;
            };

            await this.credentializeClient(resource.userId);

            const events: unknown = await this.googleService.calendarService.listEvents(resource.calendarReferenceId, this.client);

            await this.googleService.calendarService.updateCalendar(resource.calendarId!, events as GoogleEvent[]);

            res.status(200).send();
        } catch (error) {
            throw error;
        }
    }

    async syncCalendar(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.syncCalendar`
        try {
            const calendarId = req.params.calendarId;
            const user = req.user;
            
            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

            const calendarService = Container.resolve<CalendarsService>("CalendarsService");
            const resource = await calendarService.resource(calendarId);
            if(!resource) {
                throw new NotFoundError(undefined, {
                    calendarId,
                    resource: resource || "Calnedar not found"
                })
            }

            await this.credentializeClient(user.user_id);
            const accessToken = this.client.credentials.access_token;

            const result = await this.googleService.calendarService.requestCalendarNotifications(resource.calendarReferenceId, accessToken!);
            const changes = {
                watchChannel: result.watchId,
                watchChannelResourceId: result.resourceId,
                channelExpirationMs: result.expiration
            }
            console.log("changes::::",changes)

            await calendarService.update(resource.calendarId!, changes as CalendarData);
            res.status(200).json({ message: "calendar synced"})
        } catch (error) {
            throw error;
        }
    }

    async unSyncCalendar(req: Request, res: Response): Promise<void> {
        const block = `${this.block}.syncCalendar`
        try {
            const calendarId = req.params.calendarId;
            const user = req.user;
            
            this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);

            const calendarService = Container.resolve<CalendarsService>("CalendarsService");
            const resource = await calendarService.resource(calendarId);
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

            await this.credentializeClient(user.user_id);
            const accessToken = this.client.credentials.access_token;
            console.log("CALENDAR IN DB::::::", resource)
          
            await this.googleService.calendarService.CancelCalendarNotifications(resource.watchChannelResourceId, resource.watchChannel, accessToken!);
            const changes =  {
                watchChannel: null,
                watchChannelResourceId: null,
                channelExpirationMs: null
            }
            await calendarService.update(resource.calendarId!, changes as CalendarData);
            res.status(200).json({ message: "calendar unsynced"})
        } catch (error) {
            throw error;
        }
    }

    async getCalendars(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            const googleUser = await this.credentializeClient(user.user_id);

            const calendars = await this.googleService.calendarService.listCalendars(this.client);

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
            await this.credentializeClient(user.user_id);

            const data = await this.googleService.calendarService.listEvents(calendarId, this.client);
            res.status(200).json({ data: data })
        } catch (error) {
            throw error;
        }
    }
  
   
}

   