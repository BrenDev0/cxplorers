"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureEventAtendeesDependencies = configureEventAtendeesDependencies;
const EventAttendeesService_1 = __importDefault(require("./EventAttendeesService"));
const EventAttendeesController_1 = __importDefault(require("./EventAttendeesController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const EventAttendeesRepository_1 = __importDefault(require("./EventAttendeesRepository"));
function configureEventAtendeesDependencies(pool) {
    const repository = new EventAttendeesRepository_1.default(pool);
    const service = new EventAttendeesService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new EventAttendeesController_1.default(httpService, service);
    Container_1.default.register("EventAttendeesService", service);
    Container_1.default.register("EventAtendeesController", controller);
    return;
}
