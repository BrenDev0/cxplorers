"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureEventsDependencies = configureEventsDependencies;
const EventsService_1 = __importDefault(require("./EventsService"));
const EventsController_1 = __importDefault(require("./EventsController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const EventsRepository_1 = __importDefault(require("./EventsRepository"));
function configureEventsDependencies(pool) {
    const repository = new EventsRepository_1.default(pool);
    const service = new EventsService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new EventsController_1.default(httpService, service);
    Container_1.default.register("EventsService", service);
    Container_1.default.register("EventsController", controller);
    return;
}
