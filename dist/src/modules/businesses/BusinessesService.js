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
class BusinessesService {
    constructor(repository) {
        this.block = "businesses.service";
        this.repository = repository;
    }
    create(business) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedBusiness = this.mapToDb(business);
            try {
                return this.repository.create(mappedBusiness);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedBusiness);
                throw error;
            }
        });
    }
    resource(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("business_id", businessId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { businessId });
                throw error;
            }
        });
    }
    collection(businessIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.collectionByIds(businessIds);
                return result.map((business) => this.mapFromDb(business));
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { businessIds });
                throw error;
            }
        });
    }
    update(businessId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("business_id", businessId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("business_id", businessId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { businessId });
                throw error;
            }
        });
    }
    mapToDb(business) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            business_logo: business.businessLogo,
            business_name: business.businessName,
            legal_name: business.legalName,
            business_email: business.businessEmail,
            business_phone: business.businessPhone,
            branded_domain: business.brandedDomain,
            business_website: business.businessWebsite,
            business_niche: business.businessNiche,
            platform_language: business.platformLanguage,
            communication_language: business.communicationLanguage
        };
    }
    mapFromDb(business) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            businessId: business.business_id,
            businessName: business.business_name,
            legalName: business.legal_name,
            businessEmail: business.business_email,
            businessPhone: business.business_phone,
            brandedDomain: business.branded_domain,
            businessWebsite: business.business_website,
            businessNiche: business.business_niche,
            businessLogo: business.business_logo,
            platformLanguage: business.platform_language,
            communicationLanguage: business.communication_language
        };
    }
}
exports.default = BusinessesService;
