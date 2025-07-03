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
const error_service_1 = require("../../../core/errors/error.service");
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
class BusinessUserService {
    constructor(repository) {
        this.block = "businessUsers.service";
        this.repository = repository;
    }
    create(businessUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedBusinessUser = this.mapToDb(businessUser);
            try {
                return this.repository.create(mappedBusinessUser);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedBusinessUser);
                throw error;
            }
        });
    }
    resource(userId, businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.resource(userId, businessId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { userId, businessId });
                throw error;
            }
        });
    }
    update(userId, businessUserId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.updateByIds(userId, businessUserId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(userId, businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.deleteByIds(userId, businessId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { userId, businessId });
                throw error;
            }
        });
    }
    mapToDb(businessUser) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            business_id: businessUser.businessId,
            user_id: businessUser.userId,
            account_type: businessUser.accountType
        };
    }
    mapFromDb(businessUser) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            businessId: businessUser.business_id,
            userId: businessUser.user_id,
            accountType: businessUser.account_type
        };
    }
}
exports.default = BusinessUserService;
