"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureUsersDependencies = configureUsersDependencies;
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
const UsersService_1 = __importDefault(require("./UsersService"));
const UsersController_1 = __importDefault(require("./UsersController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
function configureUsersDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "users");
    const service = new UsersService_1.default(repository);
    const emailService = Container_1.default.resolve("EmailService");
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new UsersController_1.default(httpService, service, emailService);
    Container_1.default.register("UsersService", service);
    Container_1.default.register("UsersController", controller);
    return;
}
