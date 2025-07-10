import { Pool } from "pg";
import BaseRepository from "../../../core/repository/BaseRepository";
import { Tagging } from "./taggings.interface";
import TaggingsService from "./TaggingsService";
import TaggingsController from "./TaggingsController";
import Container from "../../../core/dependencies/Container";
import HttpService from "../../../core/services/HttpService";

export function configureTaggingsDependencies(pool: Pool): void {
    const repository = new BaseRepository<Tagging>(pool, "taggings");
    const service = new TaggingsService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new TaggingsController(httpService, service);

    Container.register<TaggingsService>("TaggingsService", service);
    Container.register<TaggingsController>("TaggingsController", controller);
    return;
}
