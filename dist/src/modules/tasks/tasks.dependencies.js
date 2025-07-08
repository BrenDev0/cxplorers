"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTasksDependencies = configureTasksDependencies;
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
const TasksService_1 = __importDefault(require("./TasksService"));
const TasksController_1 = __importDefault(require("./TasksController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
function configureTasksDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "tasks");
    const service = new TasksService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new TasksController_1.default(httpService, service);
    Container_1.default.register("TasksService", service);
    Container_1.default.register("TasksController", controller);
    return;
}
