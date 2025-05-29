import { google } from 'googleapis';
import Container from '../../core/dependencies/Container';
import GoogleController from './GoogleController';
import GoogleService from './GoogleService';

export function configureGoogleDependencies() {
    const googleService = new GoogleService();
    
    const googleClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URL
    );
    const googleController = new GoogleController(googleClient, googleService);

    Container.register<GoogleService>("GoogleService", googleService);
    Container.register("GoogleClient", googleClient);
    Container.register<GoogleController>("GoogleController", googleController);
    return;
}