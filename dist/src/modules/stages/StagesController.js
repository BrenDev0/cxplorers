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
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../core/errors/errors");
class StagesController {
    constructor(httpService, stagesService) {
        this.block = "stages.controller";
        this.httpService = httpService;
        this.stagesService = stagesService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const pipelineId = req.params.pipelineId;
                this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                const requiredFields = ["stages"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const { stages } = req.body;
                if (!Array.isArray(stages)) {
                    throw new errors_1.BadRequestError("Invalid data format", {
                        block: block,
                        detail: "Property 'Stages' must be of type array",
                        typeInReq: typeof stages
                    });
                }
                const mappedStages = stages.map((stage) => {
                    return Object.assign(Object.assign({}, stage), { pipelineId: pipelineId });
                });
                yield this.stagesService.createMany(mappedStages);
                res.status(200).json({ message: "stages added." });
            }
            catch (error) {
                throw error;
            }
        });
    }
    // async resourceRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.resourceRequest`;
    //   try {
    //     const stageId = 
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    collectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.collectionRequest`;
            try {
                const user = req.user;
                const pipelineId = req.params.pipelineId;
                this.httpService.requestValidation.validateUuid(pipelineId, "pipelineId", block);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(pipelineId, "PipelineService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                const data = yield this.stagesService.collection(pipelineId);
                res.status(200).json({ data: data });
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
                const stageId = req.params.stageId;
                this.httpService.requestValidation.validateUuid(stageId, "stageId", block);
                const stageResource = yield this.httpService.requestValidation.validateResource(stageId, "StagesService", "Stage not found", block);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                const allowedChanges = ["name"];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                yield this.stagesService.update(stageId, filteredChanges);
                res.status(200).json({ message: "Stage updated" });
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
                const stageId = req.params.stageId;
                this.httpService.requestValidation.validateUuid(stageId, "stageId", block);
                const stageResource = yield this.httpService.requestValidation.validateResource(stageId, "StagesService", "Stage not found", block);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                yield this.stagesService.delete(stageId);
                res.status(200).json({ message: "Stage deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = StagesController;
