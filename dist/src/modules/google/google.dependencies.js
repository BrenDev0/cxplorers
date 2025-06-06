"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGoogleDependencies = configureGoogleDependencies;
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const GoogleController_1 = __importDefault(require("./GoogleController"));
const GoogleService_1 = __importDefault(require("./GoogleService"));
const GoogleRepository_1 = require("./GoogleRepository");
const GoogleCalendarService_1 = __importDefault(require("./calendar/GoogleCalendarService"));
const GoogleClientManager_1 = __importDefault(require("./GoogleClientManager"));
const GoogleCalendarController_1 = __importDefault(require("./calendar/GoogleCalendarController"));
function configureGoogleDependencies(pool) {
    const repository = new GoogleRepository_1.GoogleRepository(pool);
    const httpService = Container_1.default.resolve("HttpService");
    const calendarService = new GoogleCalendarService_1.default;
    const platformCalendarService = Container_1.default.resolve("CalendarsService");
    const clientManager = new GoogleClientManager_1.default(repository);
    const googleService = new GoogleService_1.default(clientManager, calendarService);
    const googleCalendarController = new GoogleCalendarController_1.default(httpService, googleService, platformCalendarService);
    const googleController = new GoogleController_1.default(httpService, googleService);
    Container_1.default.register("GoogleService", googleService);
    Container_1.default.register("GoogleCalendarController", googleCalendarController);
    Container_1.default.register("GoogleController", googleController);
    return;
}
