import { Pool } from "pg";
import ContactsService from "./ContactsService";
import ContactsController from "./ContactsController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";
import ContactsRepository from "./ContactsRepository";

export function configureContactsDependencies(pool: Pool): void {
    const repository = new ContactsRepository(pool);
    const service = new ContactsService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new ContactsController(httpService, service);

    Container.register<ContactsService>("ContactsService", service);
    Container.register<ContactsController>("ContactsController", controller);
    return;
}
