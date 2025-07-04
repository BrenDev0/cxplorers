import { Pool } from "pg";
import BusinessUsersService from "./BusienssUsersService";
import BusinessUsersController from "./BusinessUsersController";
import Container from "../../../core/dependencies/Container";
import HttpService from "../../../core/services/HttpService";
import BusinessUsersRepository from "./BusinessUsersRepository";

export function configureBusinessUsersDependencies(pool: Pool): void {
    const repository = new BusinessUsersRepository(pool);
    const service = new BusinessUsersService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new BusinessUsersController(httpService, service);

    Container.register<BusinessUsersService>("BusinessUsersService", service);
    Container.register<BusinessUsersController>("BusinessUsersController", controller);
    return;
}
