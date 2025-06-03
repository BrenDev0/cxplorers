"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCalendarsDependencies = configureCalendarsDependencies;
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
const CalendarsService_1 = __importDefault(require("./CalendarsService"));
const CalendarsController_1 = __importDefault(require("./CalendarsController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
function configureCalendarsDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "calendars");
    const service = new CalendarsService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new CalendarsController_1.default(httpService, service);
    Container_1.default.register("CalendarsService", service);
    Container_1.default.register("CalendarsController", controller);
    return;
}
