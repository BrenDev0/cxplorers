"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureContactsDependencies = configureContactsDependencies;
const ContactsService_1 = __importDefault(require("./ContactsService"));
const ContactsController_1 = __importDefault(require("./ContactsController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const ContactsRepository_1 = __importDefault(require("./ContactsRepository"));
function configureContactsDependencies(pool) {
    const repository = new ContactsRepository_1.default(pool);
    const service = new ContactsService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new ContactsController_1.default(httpService, service);
    Container_1.default.register("ContactsService", service);
    Container_1.default.register("ContactsController", controller);
    return;
}
