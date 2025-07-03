import { Pool } from "pg";
import EventAttendeesService from "./EventAttendeesService";
import EventAttendeesController from "./EventAttendeesController";
import Container from "../../../core/dependencies/Container";
import HttpService from "../../../core/services/HttpService";
import EventAttendeesRepositoy from "./EventAttendeesRepository";

export function configureEventAtendeesDependencies(pool: Pool): void {
    const repository = new EventAttendeesRepositoy(pool);
    const service = new EventAttendeesService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new EventAttendeesController(httpService, service);

    Container.register<EventAttendeesService>("EventAttendeesService", service);
    Container.register<EventAttendeesController>("EventAtendeesController", controller);
    return;
}
