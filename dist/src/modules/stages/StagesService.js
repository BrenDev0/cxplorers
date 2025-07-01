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
class StagesService {
    constructor(repository) {
        this.block = "stages.service";
        this.repository = repository;
    }
    create(stage) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedStage = this.mapToDb(stage);
            try {
                return this.repository.create(mappedStage);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedStage);
                throw error;
            }
        });
    }
    createMany(stages) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedStages = stages.map((stage) => this.mapToDb(stage));
            const cols = Object.keys(mappedStages[0]);
            const values = mappedStages.flatMap(stage => cols.map(col => stage[col]));
            try {
                const result = yield this.repository.createMany(cols, values);
                return result;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "createMany", { cols, values });
                throw error;
            }
        });
    }
    resource(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("stage_id", stageId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { stageId });
                throw error;
            }
        });
    }
    collection(pipelineId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("pipeline_id", pipelineId);
                return result.map((stage) => this.mapFromDb(stage));
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { pipelineId });
                throw error;
            }
        });
    }
    update(stageId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("stage_id", stageId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("stage_id", stageId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { stageId });
                throw error;
            }
        });
    }
    mapToDb(stage) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            pipeline_id: stage.pipelineId,
            name: stage.name
        };
    }
    mapFromDb(stage) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            stageId: stage.stage_id,
            pipelineId: stage.pipeline_id,
            name: stage.name
        };
    }
}
exports.default = StagesService;
