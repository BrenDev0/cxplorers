"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePipelinesDependencies = configurePipelinesDependencies;
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
const PipelinesService_1 = __importDefault(require("./PipelinesService"));
const PipelinesController_1 = __importDefault(require("./PipelinesController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
function configurePipelinesDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "pipelines");
    const service = new PipelinesService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new PipelinesController_1.default(httpService, service);
    Container_1.default.register("PipelinesService", service);
    Container_1.default.register("PipelinesController", controller);
    return;
}
