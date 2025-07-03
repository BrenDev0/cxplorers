import { Pool } from "pg";
import PermissionsService from "./PermissionsService";
import PermissionsController from "./PermissionsController";
import Container from "../../core/dependencies/Container";
import HttpService from "../../core/services/HttpService";
import PermissionsRepository from "./PermissionsRepository";

export function configurePermissionsDependencies(pool: Pool): void {
    const repository = new PermissionsRepository(pool);
    const service = new PermissionsService(repository);
    const httpService = Container.resolve<HttpService>("HttpService");
    const controller = new PermissionsController(httpService, service);

    Container.register<PermissionsService>("PermissionsService", service);
    Container.register<PermissionsController>("PermissionsController", controller);
    return;
}
