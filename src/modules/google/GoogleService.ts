import { google } from 'googleapis';
import crypto from 'crypto';
import { RedisClientType } from '@redis/client';
import Container from '../../core/dependencies/Container';
import { OAuth2Client } from 'google-auth-library';
import { NotFoundError } from '../../core/errors/errors';
import { GoogleError } from './google.errors';

export default class GoogleService {
    private block = "google.service"

    getUrl(oauth2Client: OAuth2Client) {
      
        const scopes = [
            'https://www.googleapis.com/auth/calendar', 
            'https://www.googleapis.com/auth/calendar.events' 
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
}