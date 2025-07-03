import { Pool } from "pg";
import BaseRepository from "../../../core/repository/BaseRepository";
import { Pipeline } from "./pipelines.interface";
import PipelinesService from "./PipelinesService";
import PipelinesController from "./PipelinesController";
import Container from "../../../core/dependencies/Container";
import HttpService from "../../../core/services/HttpService";

export function configurePipelinesDependencies(pool: Pool): void {
    const repository = new BaseRepository<Pipeline>(pool, "pipelines");
    const service = new PipelinesService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new PipelinesController(httpService, service);

    Container.register<PipelinesService>("PipelinesService", service);
    Container.register<PipelinesController>("PipelinesController", controller);
    return;
}
