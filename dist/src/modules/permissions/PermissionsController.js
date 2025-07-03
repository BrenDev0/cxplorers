"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PermissionsController {
    constructor(httpService, permissionsService) {
        this.block = "permissions.controller";
        this.httpService = httpService;
        this.permissionsService = permissionsService;
    }
}
exports.default = PermissionsController;
