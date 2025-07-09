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
class TokenService {
    constructor(repository) {
        this.block = "tokens.service";
        this.repository = repository;
    }
    create(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedToken = this.mapToDb(token);
            try {
                return this.repository.create(mappedToken);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedToken);
                throw error;
            }
        });
    }
    resource(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("token_id", tokenId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { tokenId });
                throw error;
            }
        });
    }
    collection(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("business_id", businessId);
                const data = result.map((token) => this.mapFromDb(token));
                return data;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { businessId });
                throw error;
            }
        });
    }
    update(tokenId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("token_id", tokenId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", { cleanedChanges, tokenId });
                throw error;
            }
        });
    }
    delete(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("token_id", tokenId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { tokenId });
                throw error;
            }
        });
    }
    mapToDb(token) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            token: token.token && encryptionService.encryptData(token.token),
            business_id: token.businessId,
            type: token.type,
            service: token.service
        };
    }
    mapFromDb(token) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            tokenId: token.token_id,
            token: encryptionService.decryptData(token.token),
            businessId: token.business_id,
            type: token.type,
            service: token.service
        };
    }
}
exports.default = TokenService;
