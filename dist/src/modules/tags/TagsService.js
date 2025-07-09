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
class TagsService {
    constructor(repository) {
        this.block = "tags.service";
        this.repository = repository;
    }
    create(tags) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedTag = this.mapToDb(tags);
            try {
                return this.repository.create(mappedTag);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedTag);
                throw error;
            }
        });
    }
    resource(tagId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("tag_id", tagId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { tagId });
                throw error;
            }
        });
    }
    collection(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("business_id", businessId);
                return result.map((tag) => this.mapFromDb(tag));
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { businessId });
                throw error;
            }
        });
    }
    update(tagId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("tag_id", tagId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(tagId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("tag_id", tagId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { tagId });
                throw error;
            }
        });
    }
    mapToDb(tag) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            business_id: tag.businessId,
            tag: tag.tag
        };
    }
    mapFromDb(tag) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            tagId: tag.tag_id,
            businessId: tag.business_id,
            tag: tag.tag
        };
    }
}
exports.default = TagsService;
