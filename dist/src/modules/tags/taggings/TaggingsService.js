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
class TaggingsService {
    constructor(repository) {
        this.block = "taggings.service";
        this.repository = repository;
    }
    create(taggings) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedTagging = this.mapToDb(taggings);
            try {
                return this.repository.create(mappedTagging);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedTagging);
                throw error;
            }
        });
    }
    resource(tagId, contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.resource(tagId, contactId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { tagId, contactId });
                throw error;
            }
        });
    }
    collection(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select(whereCol, identifier);
                return result.map((tagging) => this.mapFromDb(tagging));
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { whereCol, identifier });
                throw error;
            }
        });
    }
    // async update(taggingId: string, changes: TaggingData): Promise<Tagging> {
    //     const mappedChanges = this.mapToDb(changes);
    //     const cleanedChanges = Object.fromEntries(
    //         Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
    //     );
    //     try {
    //         return await this.repository.update("tagging_id", taggingId, cleanedChanges);
    //     } catch (error) {
    //         handleServiceError(error as Error, this.block, "update", cleanedChanges)
    //         throw error;
    //     }
    // }
    delete(tagId, contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.deleteByIds(tagId, contactId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { tagId, contactId });
                throw error;
            }
        });
    }
    mapToDb(tagging) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            tag_id: tagging.tagId,
            contact_id: tagging.contactId
        };
    }
    mapFromDb(tagging) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            tagId: tagging.tag_id,
            contactId: tagging.contact_id
        };
    }
}
exports.default = TaggingsService;
