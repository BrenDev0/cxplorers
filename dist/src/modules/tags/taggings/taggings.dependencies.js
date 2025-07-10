"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTaggingsDependencies = configureTaggingsDependencies;
const TaggingsService_1 = __importDefault(require("./TaggingsService"));
const TaggingsController_1 = __importDefault(require("./TaggingsController"));
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const TaggingsRepository_1 = __importDefault(require("./TaggingsRepository"));
function configureTaggingsDependencies(pool) {
    const repository = new TaggingsRepository_1.default(pool);
    const service = new TaggingsService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new TaggingsController_1.default(httpService, service);
    Container_1.default.register("TaggingsService", service);
    Container_1.default.register("TaggingsController", controller);
    return;
}
