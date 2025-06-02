import { Pool } from "pg";
import UsersService from "./UsersService";
import UsersController from "./UsersController";
import Container from "../../core/dependencies/Container";
import EmailService from "../../core/services/EmailService";
import HttpService from "../../core/services/HttpService";
import UsersRepository from "./UsersRepository";

export function configureUsersDependencies(pool: Pool): void {
    const repository = new UsersRepository(pool);
    const service = new UsersService(repository);
    const emailService = Container.resolve<EmailService>("EmailService");
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new UsersController(httpService, service, emailService);

    Container.register<UsersService>("UsersService", service);
    Container.register<UsersController>("UsersController", controller);
    return;
}
