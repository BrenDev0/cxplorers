import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Contact } from "./contacts.interface";
import ContactsService from "./ContactsService";
import ContactsController from "./ContactsController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";

export function configureContactsDependencies(pool: Pool): void {
    const repository = new BaseRepository<Contact>(pool, "contacts");
    const service = new ContactsService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new ContactsController(httpService, service);

    Container.register<ContactsService>("ContactsService", service);
    Container.register<ContactsController>("ContactsController", controller);
    return;
}
