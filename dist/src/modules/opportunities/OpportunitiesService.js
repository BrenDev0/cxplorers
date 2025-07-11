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
class OpportunitiesService {
    constructor(repository) {
        this.block = "opportunities.service";
        this.repository = repository;
    }
    create(opportunity) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedOpportunity = this.mapToDb(opportunity);
            try {
                return this.repository.create(mappedOpportunity);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedOpportunity);
                throw error;
            }
        });
    }
    resource(opportunityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("opportunity_id", opportunityId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { opportunityId });
                throw error;
            }
        });
    }
    collection(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("stage_id", stageId);
                return result.map((opportunity) => this.mapFromDb(opportunity));
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { stageId });
                throw error;
            }
        });
    }
    update(opportunityId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("opportunity_id", opportunityId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(opportunityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("opportunity_id", opportunityId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { opportunityId });
                throw error;
            }
        });
    }
    mapToDb(opportunity) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            stage_id: opportunity.stageId,
            contact_id: opportunity.contactId,
            opportunity_value: opportunity.opportunityValue !== undefined && opportunity.opportunityValue !== null
                ? opportunity.opportunityValue.toFixed(2)
                : null,
            notes: opportunity.notes,
            opportunity_name: opportunity.opportunityName,
            opportunity_source: opportunity.opportunitySource,
            opportunity_status: opportunity.opportunityStatus,
            opportunity_business_name: opportunity.opportunityBusinessName,
            user_id: opportunity.userId
        };
    }
    mapFromDb(opportunity) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            opportunityId: opportunity.opportunity_id,
            stageId: opportunity.stage_id,
            contactId: opportunity.contact_id,
            opportunityValue: opportunity.opportunity_value !== null
                ? Number(opportunity.opportunity_value)
                : null,
            notes: opportunity.notes,
            opportunityName: opportunity.opportunity_name,
            opportunitySource: opportunity.opportunity_source,
            opportunityStatus: opportunity.opportunity_status,
            opportunityBusinessName: opportunity.opportunity_business_name,
            userId: opportunity.user_id
        };
    }
}
exports.default = OpportunitiesService;
