"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureStagesDependencies = configureStagesDependencies;
const StagesService_1 = __importDefault(require("./StagesService"));
const StagesController_1 = __importDefault(require("./StagesController"));
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const StagesRepository_1 = __importDefault(require("./StagesRepository"));
function configureStagesDependencies(pool) {
    const repository = new StagesRepository_1.default(pool);
    const service = new StagesService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new StagesController_1.default(httpService, service);
    Container_1.default.register("StagesService", service);
    Container_1.default.register("StagesController", controller);
    return;
}
