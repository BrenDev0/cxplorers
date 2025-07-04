"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../core/errors/errors");
class PermissionsController {
    constructor(httpService, permissionsService) {
        this.block = "permissions.controller";
        this.httpService = httpService;
        this.permissionsService = permissionsService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const userPermissions = req.permissions;
                const role = req.role;
                const businessUserId = req.params.businessUserId;
                this.httpService.requestValidation.validateUuid(businessUserId, "businessUserId", block);
                yield this.httpService.requestValidation.validateResource(businessUserId, "BusinessUsersService", "Business user not found", block);
                const requiredfields = ["permissions"];
                this.httpService.requestValidation.validateRequestBody(requiredfields, req.body, block);
                const { permissions } = req.body;
                if (!Array.isArray(permissions)) {
                    throw new errors_1.BadRequestError("Permissions must be of type array");
                }
                const permissionsData = [];
                const requiredPermissionsFields = ["moduleName", "action"];
                for (const permission of permissions) {
                    this.httpService.requestValidation.validateRequestBody(requiredPermissionsFields, permission, block);
                    permissionsData.push(Object.assign(Object.assign({}, permission), { businessUserId }));
                }
                yield this.permissionsService.upsert(permissionsData);
                res.status(200).json({ message: "permissions added." });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = PermissionsController;
