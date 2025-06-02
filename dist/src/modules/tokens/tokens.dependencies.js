"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTokensDependencies = configureTokensDependencies;
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
const TokensService_1 = __importDefault(require("./TokensService"));
const TokensController_1 = __importDefault(require("./TokensController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
function configureTokensDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "tokens");
    const service = new TokensService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new TokensController_1.default(httpService, service);
    Container_1.default.register("TokensService", service);
    Container_1.default.register("TokensController", controller);
    return;
}
