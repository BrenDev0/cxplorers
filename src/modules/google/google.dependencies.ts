import { google } from 'googleapis';
import Container from '../../core/dependencies/Container';
import GoogleController from './GoogleController';
import GoogleService from './GoogleService';
import { GoogleRepository } from './GoogleRepository';
import { Pool } from 'pg';
import GoogleCalendarService from './services/googleCalendarService';

export function configureGoogleDependencies(pool: Pool) {
    const repository = new GoogleRepository(pool);
    const calendarService = new GoogleCalendarService;
    const googleService = new GoogleService(repository, calendarService);
    
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