"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BusinessUsersController {
    constructor(httpService, businessUsersService) {
        this.block = "businessUsers.controller";
        this.httpService = httpService;
        this.businessUsersService = businessUsersService;
    }
}
exports.default = BusinessUsersController;
