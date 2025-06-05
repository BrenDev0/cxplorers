import { OAuth2Client } from "google-auth-library";
import { GoogleUser } from "./google.interface";
import { handleServiceError } from "../../core/errors/error.service";
import Container from "../../core/dependencies/Container";
import EncryptionService from "../../core/services/EncryptionService";
import { GoogleRepository } from "./GoogleRepository";
import { google } from "googleapis";

export default class GoogleClientManager {
    private repository: GoogleRepository;
    private readonly block = "google.service.clientManager";

    constructor(repository: GoogleRepository) {
        this.repository = repository;
    }

    getClient(): OAuth2Client {
        const client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        return client
    } 

    async getcredentialedClient(userId: string): Promise<OAuth2Client> {
        const client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        const user = await this.getUser(userId)
        
        client.setCredentials({
            refresh_token: user.refresh_token
        })

        const accessToken = await this.refreshAccessToken(client);

        client.setCredentials({
            access_token: accessToken
        })

        return client;
    } 

    async refreshAccessToken(oauth2Client: OAuth2Client) {
        try {
            const { token } = await oauth2Client.getAccessToken();
            
            return token;
        } catch (error) {
            console.error('Error refreshing access token', error);
            throw error;
        }
    }

    async getUser(userId: string): Promise<GoogleUser> {
        const block = `${this.block}.getUser`
        try {
            const data = await this.repository.getGoogleUser(userId);
          
            return this.mapGoogleUser(data);
        } catch (error) {
            handleServiceError(error as Error, this.block, "getUser", {userId})
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