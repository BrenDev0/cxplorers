import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Business } from "./businesses.interface";
import BusinessesService from "./BusinessesService";
import BusinessesController from "./BusinessesController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";

export function configureBusinessesDependencies(pool: Pool): void {
    const repository = new BaseRepository<Business>(pool, "businesses");
    const service = new BusinessesService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new BusinessesController(httpService, service);

    Container.register<BusinessesService>("BusinessesService", service);
    Container.register<BusinessesController>("BusinessesController", controller);
    return;
}
