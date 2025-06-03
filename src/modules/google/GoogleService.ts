import { google } from 'googleapis';
import crypto from 'crypto';
import { RedisClientType } from '@redis/client';
import Container from '../../core/dependencies/Container';
import { OAuth2Client } from 'google-auth-library';
import { NotFoundError } from '../../core/errors/errors';
import { GoogleError } from './google.errors';
import { GoogleRepository } from './GoogleRepository';
import { GoogleUser } from './google.interface';
import { handleServiceError } from '../../core/errors/error.service';
import EncryptionService from '../../core/services/EncryptionService';

export default class GoogleService {
    private block = "google.service";
    private repository: GoogleRepository;

    constructor(repository: GoogleRepository) {
        this.repository = repository;
    }

    async getUser(userId: string): Promise<GoogleUser> {
        try {
            const data = await this.repository.getGoogleUser(userId);

            return this.mapGoogleUser(data);
        } catch (error) {
            handleServiceError(error as Error, this.block, "getUser", {userId})
            throw error;
        }
    }

    getUrl(oauth2Client: OAuth2Client) {
      
        const scopes = [
            // Google Sheets (read/write)
            'https://www.googleapis.com/auth/spreadsheets',

            // Google Calendar (read/write)
            'https://www.googleapis.com/auth/calendar',

            // Google Drive (read/write + folder/file access)
            'https://www.googleapis.com/auth/drive',

            // Google Docs (read/write)
            'https://www.googleapis.com/auth/documents'
        ];

       
        const redisClient: RedisClientType = Container.resolve("RedisClient"); 
        const state = crypto.randomBytes(32).toString('hex');
        redisClient.setEx(`oauth_state:${state}`, 900, 'valid') // 15m

        const authorizationUrl = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes,
          
            include_granted_scopes: true,
           
            state: state
        });

        return authorizationUrl;
    }

    async listCalendars(oauth2Client: OAuth2Client) {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client});

        const res = await calendar.calendarList.list();
        
        const calendars = res.data.items
        
        if (!calendars || calendars.length === 0) {
            throw new NotFoundError("no calendars found in google drive")
        }

        return calendars.filter((calendar) => calendar.accessRole === 'owner');
    }

    // async searchDrive(oauth2Client: OAuth2Client, filter: string, customQuery?: string) {
    //     const block = `${this.block}.SearchDrive`
    //     try {
    //         let query;
    //     switch(filter) {
    //         case "sheet":
    //             query = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
    //             break;
    //         case "folder":
    //             query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
    //             break;
    //         case "file":
    //             query = customQuery; 
    //             break;   
    //         default: 
    //             throw new Error("Invalid filter") ;   
    //     }
      
    //     const drive = google.drive({ version: 'v3', auth: oauth2Client });
    //     const res = await drive.files.list({
    //         q: query,
    //         fields: 'files(id, name, mimeType, webContentLink)',
    //         pageSize: 100,
    //     });
    
    //     return res.data.files || [];
    //     } catch (error) {
    //         throw new GoogleError(undefined, {
    //             block: block,
    //             originalError: (error as Error).message
    //         });
    //     }
    // }

    async refreshAccessToken(oauth2Client: OAuth2Client) {
        try {
            const { token } = await oauth2Client.getAccessToken();
            
            return token;
        } catch (error) {
            console.error('Error refreshing access token', error);
            throw error;
        }
    }

    mapGoogleUser(user: GoogleUser): GoogleUser {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            refresh_token: user.refresh_token && encryptionService.decryptData(user.refresh_token)
        }
    }
}