"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureOpportunitiesDependencies = configureOpportunitiesDependencies;
const BaseRepository_1 = __importDefault(require("../../core/repository/BaseRepository"));
const OpportunitiesService_1 = __importDefault(require("./OpportunitiesService"));
const OpportunitiesController_1 = __importDefault(require("./OpportunitiesController"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
function configureOpportunitiesDependencies(pool) {
    const repository = new BaseRepository_1.default(pool, "opportunities");
    const service = new OpportunitiesService_1.default(repository);
    const httpService = Container_1.default.resolve("HttpService");
    const controller = new OpportunitiesController_1.default(httpService, service);
    Container_1.default.register("OpportunitiesService", service);
    Container_1.default.register("OpportunitiesController", controller);
    return;
}
