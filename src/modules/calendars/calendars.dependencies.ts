import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Calendar } from "./calendars.interface";
import CalendarsService from "./CalendarsService";
import CalendarsController from "./CalendarsController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";

export function configureCalendarsDependencies(pool: Pool): void {
    const repository = new BaseRepository<Calendar>(pool, "calendars");
    const service = new CalendarsService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new CalendarsController(httpService, service);

    Container.register<CalendarsService>("CalendarsService", service);
    Container.register<CalendarsController>("CalendarsController", controller);
    return;
}
