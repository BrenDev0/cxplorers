import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { User } from "./users.interface";
import UsersService from "./UsersService";
import UsersController from "./UsersController";
import Container from "../../core/dependencies/Container";
import EmailService from "../../core/services/EmailService";

export function configureUsersDependencies(pool: Pool): void {
    const repository = new BaseRepository<User>(pool, "users");
    const service = new UsersService(repository);
    const emailService = Container.resolve<EmailService>("EmailService");
    const controller = new UsersController(service, emailService);

    Container.register<UsersService>("UsersService", service);
    Container.register<UsersController>("UsersController", controller);
    return;
}
