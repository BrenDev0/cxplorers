"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTagsDependencies = configureTagsDependencies;
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
const TagsService_1 = __importDefault(require("./TagsService"));
const TagsController_1 = __importDefault(require("./TagsController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
function configureTagsDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "tags");
    const service = new TagsService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new TagsController_1.default(httpService, service);
    Container_1.default.register("TagsService", service);
    Container_1.default.register("TagsController", controller);
    return;
}
