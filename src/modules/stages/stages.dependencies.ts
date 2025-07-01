import { Pool } from "pg";
import StagesService from "./StagesService";
import StagesController from "./StagesController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";
import StagesRepository from "./StagesRepository";

export function configureStagesDependencies(pool: Pool): void {
    const repository = new StagesRepository(pool);
    const service = new StagesService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new StagesController(httpService, service);

    Container.register<StagesService>("StagesService", service);
    Container.register<StagesController>("StagesController", controller);
    return;
}
