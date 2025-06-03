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
class UsersService {
    constructor(repository) {
        this.block = "users.service";
        this.repository = repository;
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedUser = this.mapToDb(user);
            try {
                // from parent class ../../core/repository/BaseRepository
                return this.repository.create(mappedUser);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedUser);
                throw error;
            }
        });
    }
    // do not map user for internal use, handle mapping in controller for frontend use
    resource(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // from parent class ../../core/repository/BaseRepository
                const result = yield this.repository.selectOne(whereCol, identifier);
                if (!result) {
                    return null;
                }
                return result;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { whereCol, identifier });
                throw error;
            }
        });
    }
    update(userId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                // from parent class ../../core/repository/BaseRepository
                return yield this.repository.update("user_id", userId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // from parent class ../../core/repository/BaseRepository
                return yield this.repository.delete("user_id", userId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { userId });
                throw error;
            }
        });
    }
    mapToDb(user) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            email: user.email && encryptionService.encryptData(user.email),
            name: user.name && encryptionService.encryptData(user.name),
            phone: user.phone && encryptionService.encryptData(user.phone),
            password: user.password
        };
    }
    mapFromDb(user) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            userId: user.user_id,
            email: encryptionService.decryptData(user.email),
            name: encryptionService.decryptData(user.name),
            phone: encryptionService.decryptData(user.phone),
            createdAt: user.created_at
        };
    }
}
exports.default = UsersService;
