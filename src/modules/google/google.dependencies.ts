import Container from '../../core/dependencies/Container';
import GoogleController from './GoogleController';
import GoogleService from './GoogleService';
import { GoogleRepository } from './GoogleRepository';
import { Pool } from 'pg';
import GoogleCalendarService from './calendar/GoogleCalendarService';
import HttpService from '../../core/services/HttpService';
import GoogleClientManager from './GoogleClientManager';
import GoogleCalendarController from './calendar/GoogleCalendarController';

export function configureGoogleDependencies(pool: Pool) {
    const repository = new GoogleRepository(pool);
    const httpService = Container.resolve<HttpService>("HttpService");
    const calendarService = new GoogleCalendarService;
    const clientManager = new GoogleClientManager(repository);
    const googleService = new GoogleService(clientManager, calendarService);
    const googleCalendarController = new GoogleCalendarController(httpService, googleService)
    const googleController = new GoogleController(httpService, googleService);

    Container.register<GoogleService>("GoogleService", googleService);
    Container.register<GoogleCalendarController>("GoogleCalendarController", googleCalendarController);
    Container.register<GoogleController>("GoogleController", googleController);
    return;
}