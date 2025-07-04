"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureBusinessesDependencies = configureBusinessesDependencies;
const BusinessesService_1 = __importDefault(require("./BusinessesService"));
const BusinessesController_1 = __importDefault(require("./BusinessesController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const BusinessesRepository_1 = __importDefault(require("./BusinessesRepository"));
function configureBusinessesDependencies(pool) {
    const repository = new BusinessesRepository_1.default(pool);
    const service = new BusinessesService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new BusinessesController_1.default(httpService, service);
    Container_1.default.register("BusinessesService", service);
    Container_1.default.register("BusinessesController", controller);
    return;
}
