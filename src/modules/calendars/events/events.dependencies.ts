import { Pool } from "pg";
import BaseRepository from "../../../core/repository/BaseRepository";
import { Event } from "./events.interface";
import EventsService from "./EventsService";
import EventsController from "./EventsController";
import Container from "../../../core/dependencies/Container";
import HttpService from "../../../core/services/HttpService";
import EventsRepository from "./EventsRepository";

export function configureEventsDependencies(pool: Pool): void {
    const repository = new EventsRepository(pool);
    const service = new EventsService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new EventsController(httpService, service);

    Container.register<EventsService>("EventsService", service);
    Container.register<EventsController>("EventsController", controller);
    return;
}
