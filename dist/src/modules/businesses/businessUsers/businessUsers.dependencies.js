"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureBusinessUsersDependencies = configureBusinessUsersDependencies;
const BusinessUsersService_1 = __importDefault(require("./BusinessUsersService"));
const BusinessUsersController_1 = __importDefault(require("./BusinessUsersController"));
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const BusinessUsersRepository_1 = __importDefault(require("./BusinessUsersRepository"));
function configureBusinessUsersDependencies(pool) {
    const repository = new BusinessUsersRepository_1.default(pool);
    const service = new BusinessUsersService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new BusinessUsersController_1.default(httpService, service);
    Container_1.default.register("BusinessUsersService", service);
    Container_1.default.register("BusinessUsersController", controller);
    return;
}
