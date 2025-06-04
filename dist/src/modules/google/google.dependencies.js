"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGoogleDependencies = configureGoogleDependencies;
const googleapis_1 = require("googleapis");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const GoogleController_1 = __importDefault(require("./GoogleController"));
const GoogleService_1 = __importDefault(require("./GoogleService"));
const GoogleRepository_1 = require("./GoogleRepository");
const changeme_1 = __importDefault(require("./services/changeme"));
function configureGoogleDependencies(pool) {
    const repository = new GoogleRepository_1.GoogleRepository(pool);
    const httpService = Container_1.default.resolve("HttpService");
    const calendarService = new changeme_1.default;
    const googleService = new GoogleService_1.default(repository, calendarService);
    const googleClient = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URL);
    const googleController = new GoogleController_1.default(httpService, googleClient, googleService);
    Container_1.default.register("GoogleService", googleService);
    Container_1.default.register("GoogleClient", googleClient);
    Container_1.default.register("GoogleController", googleController);
    return;
}
