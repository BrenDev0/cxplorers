import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Opportunity } from "./opportunities.interface";
import OpportunitiesService from "./OpportunitiesService";
import OpportunitiesController from "./OpportunitiesController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";

export function configureOpportunitiesDependencies(pool: Pool): void {
    const repository = new BaseRepository<Opportunity>(pool, "opportunities");
    const service = new OpportunitiesService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new OpportunitiesController(httpService, service);

    Container.register<OpportunitiesService>("OpportunitiesService", service);
    Container.register<OpportunitiesController>("OpportunitiesController", controller);
    return;
}
