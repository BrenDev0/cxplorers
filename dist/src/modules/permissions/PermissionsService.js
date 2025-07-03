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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_service_1 = require("../../core/errors/error.service");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
class PermissionsService {
    constructor(repository) {
        this.block = "permissions.service";
        this.repository = repository;
    }
    create(permission) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedPermission = this.mapToDb(permission);
            try {
                return this.repository.create(mappedPermission);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedPermission);
                throw error;
            }
        });
    }
    upsert(permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedPermissions = permissions.map((permission) => this.mapToDb(permission));
            const cols = Object.keys(mappedPermissions[0]);
            const values = mappedPermissions.flatMap(permission => cols.map(col => permission[col]));
            try {
                const result = yield this.repository.upsert(cols, values);
                return result;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "upsert", permissions);
                throw error;
            }
        });
    }
    resource(permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("permission_id", permissionId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { permissionId });
                throw error;
            }
        });
    }
    update(permissionId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("permission_id", permissionId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("permission_id", permissionId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { permissionId });
                throw error;
            }
        });
    }
    mapToDb(permission) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            permission_id: permission.permissionId,
            user_id: permission.userId,
            module_name: permission.moduleName,
            action: permission.action
        };
    }
    mapFromDb(permission) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            permissionId: permission.permission_id,
            userId: permission.user_id,
            moduleName: permission.module_name,
            action: permission.action
        };
    }
}
exports.default = PermissionsService;
