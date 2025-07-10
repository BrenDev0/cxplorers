"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTaggingsDependencies = configureTaggingsDependencies;
const BaseRepository_1 = __importDefault(require("../../../core/repository/BaseRepository"));
const TaggingsService_1 = __importDefault(require("./TaggingsService"));
const TaggingsController_1 = __importDefault(require("./TaggingsController"));
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
function configureTaggingsDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "taggings");
    const service = new TaggingsService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new TaggingsController_1.default(httpService, service);
    Container_1.default.register("TaggingsService", service);
    Container_1.default.register("TaggingsController", controller);
    return;
}
