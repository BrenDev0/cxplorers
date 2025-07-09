import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Tag } from "./tags.interface";
import TagsService from "./TagsService";
import TagsController from "./TagsController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";

export function configureTagsDependencies(pool: Pool): void {
    const repository = new BaseRepository<Tag>(pool, "tags");
    const service = new TagsService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new TagsController(httpService, service);

    Container.register<TagsService>("TagsService", service);
    Container.register<TagsController>("TagsController", controller);
    return;
}
