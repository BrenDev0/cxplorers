"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePermissionsDependencies = configurePermissionsDependencies;
const PermissionsService_1 = __importDefault(require("./PermissionsService"));
const PermissionsController_1 = __importDefault(require("./PermissionsController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const PermissionsRepository_1 = __importDefault(require("./PermissionsRepository"));
function configurePermissionsDependencies(pool) {
    const repository = new PermissionsRepository_1.default(pool);
    const service = new PermissionsService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new PermissionsController_1.default(httpService, service);
    Container_1.default.register("PermissionsService", service);
    Container_1.default.register("PermissionsController", controller);
    return;
}
