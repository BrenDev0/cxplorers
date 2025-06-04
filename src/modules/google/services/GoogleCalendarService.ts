import { NotFoundError } from "../../../core/errors/errors";
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { GoogleError } from "../google.errors";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface notificationResult {
    watchId: string;
    resourceId: string;
    expiration: number;
}

export default class GoogleCalendarService {
    private readonly block = "google.services.calendar"
    async listCalendars(oauth2Client: OAuth2Client) {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client});

        const res = await calendar.calendarList.list();
        
        const calendars = res.data.items
        
        if (!calendars || calendars.length === 0) {
            throw new NotFoundError("no calendars found in google drive")
        }

        return calendars.filter((calendar) => calendar.accessRole === 'owner');
    }

    async listEvents(calendarReferenceId: string, oauth2Client: OAuth2Client) {
        const block = `${this.block}.listEvents`
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const res = await calendar.events.list({
                calendarId: calendarReferenceId
            })
            
            const events = res.data.items
        
        if (!events || events.length === 0) {
            throw new NotFoundError("no calendars found in google drive")
        }
            
            return events;
        } catch (error) {
            throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

    async requestCalendarNotifications(calendarReferenceId: string, accessKey: string): Promise<notificationResult> {
        const block = `${this.block}.requesNotifications`
        try {
            const watchId = uuidv4();
            const response = await axios.post(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarReferenceId)}/events/watch`,
            {
                id: watchId,
                type: 'web_hook',
                address: `https://${process.env.HOST}/google/calendars/notifications`,
                params: {
                ttl: 86400 // Optional: time in seconds (1 day)
                }
            },
            {
                headers: {
                Authorization: `Bearer ${accessKey}`,
                'Content-Type': 'application/json',
                }
            }
            );

            console.log('Watch response:', response.data);

            return {
                watchId, 
                resourceId: response.data.resourceId,
                expiration: response.data.expiration
            };
        } catch (error) {
            throw new GoogleError(undefined, {
                block: block,
                originalError: (error as Error).message
            });
        }
    }

    async CancelCalendarNotifications(channelResourceId: string, channelId: string, accessToken: string) {
        try {
          await axios.post(
            'https://www.googleapis.com/calendar/v3/channels/stop',
            {
                id: channelId,
                resourceId: channelResourceId,
            },
            {
                headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                },
            }
            );
            console.log('Channel stopped successfully');
            return;
        } catch (error) {
           throw error;
        }
    }
}