import { Pool } from "pg";
import BaseRepository from "../../core/repository/BaseRepository";
import { Token } from "./tokens.interface";
import TokensService from "./TokensService";
import TokensController from "./TokensController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";

export function configureTokensDependencies(pool: Pool): void {
    const repository = new BaseRepository<Token>(pool, "tokens");
    const service = new TokensService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new TokensController(httpService, service);

    Container.register<TokensService>("TokensService", service);
    Container.register<TokensController>("TokensController", controller);
    return;
}
