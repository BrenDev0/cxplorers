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
const errors_1 = require("../../core/errors/errors");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
class PipelinesController {
    constructor(httpService, pipelinesService) {
        this.block = "pipelines.controller";
        this.httpService = httpService;
        this.pipelinesService = pipelinesService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const requiredFields = ["name"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const pipelineData = Object.assign(Object.assign({}, req.body), { userId: req.user.user_id });
                const newPipeline = yield this.pipelinesService.create(pipelineData);
                if (req.body.stages) {
                    const { stages } = req.body;
                    const stagesService = Container_1.default.resolve("StagesService");
                    if (!Array.isArray(stages)) {
                        throw new errors_1.BadRequestError("Invalid data format", {
                            block: block,
                            detail: "Property 'Stages' must be of type array",
                            typeInReq: typeof stages
                        });
                    }
                    const mappedStages = stages.map((stage) => {
                        return Object.assign(Object.assign({}, stage), { pipelineId: newPipeline.pipeline_id });
                    });
                    yield stagesService.upsert(mappedStages);
                }
                res.status(200).json({ message: "pipeline added." });
            }
            catch (error) {
                throw error;
            }
        });
    }
    resourceRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.resourceRequest`;
            try {
                const user = req.user;
                const pipelineId = req.params.pipelineId;
                const resource = yield this.httpService.requestValidation.validateResource(pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);
                res.status(200).json({ data: resource });
            }
            catch (error) {
                throw error;
            }
        });
    }
    collectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const data = yield this.pipelinesService.collection(user.user_id);
                res.status(200).json({ data });
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateRequest`;
            try {
                const user = req.user;
                const pipelineId = req.params.pipelineId;
                this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block);
                const resource = yield this.httpService.requestValidation.validateResource(pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);
                const allowedChanges = ["name", "stages"];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                if (req.body.stages) {
                    const { stages } = req.body;
                    if (!Array.isArray(stages)) {
                        throw new errors_1.BadRequestError("Invalid data format", {
                            block: block,
                            detail: "Property 'Stages' must be of type array",
                            typeInReq: typeof stages
                        });
                    }
                    ;
                    const stagesService = Container_1.default.resolve("StagesService");
                    const stagesData = [];
                    for (const stage of stages) {
                        const requiredStageFields = ["name", "pipelineId", "position", "stageId"];
                        this.httpService.requestValidation.validateRequestBody(requiredStageFields, stage, block);
                        stagesData.push(stage);
                    }
                    yield stagesService.upsert(stagesData);
                }
                if (filteredChanges.name) {
                    yield this.pipelinesService.update(pipelineId, filteredChanges);
                }
                res.status(200).json({ message: "pipeline updated" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.deleteRequest`;
            try {
                const user = req.user;
                const pipelineId = req.params.pipelineId;
                this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block);
                const resource = yield this.httpService.requestValidation.validateResource(pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);
                yield this.pipelinesService.delete(pipelineId);
                res.status(200).json({ message: "Pipeline deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = PipelinesController;
