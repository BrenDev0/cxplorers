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
class PipelinesService {
    constructor(repository) {
        this.block = "pipelines.service";
        this.repository = repository;
    }
    create(pipeline) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedPipeline = this.mapToDb(pipeline);
            try {
                return this.repository.create(mappedPipeline);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedPipeline);
                throw error;
            }
        });
    }
    resource(pipelineId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("pipeline_id", pipelineId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { pipelineId });
                throw error;
            }
        });
    }
    collection(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("business_id", businessId);
                return result.map((pipeline) => this.mapFromDb(pipeline));
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { businessId });
                throw error;
            }
        });
    }
    update(pipelineId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            console.log("mappedChanges::::", mappedChanges, " cleanedChanges:::::", cleanedChanges);
            try {
                return yield this.repository.update("pipeline_id", pipelineId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(pipelineId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("pipeline_id", pipelineId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { pipelineId });
                throw error;
            }
        });
    }
    mapToDb(pipeline) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            business_id: pipeline.businessId,
            in_funnel_chart: pipeline.inFunnelChart,
            in_pie_chart: pipeline.inPieChart,
            name: pipeline.name
        };
    }
    mapFromDb(pipeline) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            pipelineId: pipeline.pipeline_id,
            businessId: pipeline.business_id,
            name: pipeline.name,
            inFunnelChart: pipeline.in_funnel_chart,
            inPieChart: pipeline.in_pie_chart,
            createdAt: pipeline.created_at
        };
    }
}
exports.default = PipelinesService;
