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
class OpportunitiesController {
    constructor(httpService, opportuniesService) {
        this.block = "opportunies.controller";
        this.httpService = httpService;
        this.opportuniesService = opportuniesService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const requiredFields = ["contactId", "stageId"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const { contactId, stageId } = req.body;
                this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
                this.httpService.requestValidation.validateUuid(stageId, "stageId", block);
                const [stageResource, contactResource] = yield Promise.all([
                    this.httpService.requestValidation.validateResource(stageId, "StagesService", "Stage not found", block),
                    this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block)
                ]);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                // this.httpService.requestValidation.validateActionAuthorization(user.user_id, contactResource.userId, block);
                yield this.opportuniesService.create(req.body);
                res.status(200).json({ message: "Opportunity added." });
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
                const opportunityId = req.params.opportunityId;
                this.httpService.requestValidation.validateUuid(opportunityId, "opprotunityId", block);
                const opportunityResource = yield this.httpService.requestValidation.validateResource(opportunityId, "OpportunitiesService", "Opportunity notfound", block);
                const stageResource = yield this.httpService.requestValidation.validateResource(opportunityResource.stageId, "StagesService", "Stage not found", block);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                res.status(200).json({ data: opportunityResource });
            }
            catch (error) {
                throw error;
            }
        });
    }
    collectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.collectionRequest`;
            try {
                const user = req.user;
                const stageId = req.params.stageId;
                this.httpService.requestValidation.validateUuid(stageId, "stageId", block);
                const stageResource = yield this.httpService.requestValidation.validateResource(stageId, "StagesService", "Stage not found", block);
                const dataPromise = this.opportuniesService.collection(stageId);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                const data = yield dataPromise;
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
                const opportunityId = req.params.opportunityId;
                this.httpService.requestValidation.validateUuid(opportunityId, "opprotunityId", block);
                const opportunityResource = yield this.httpService.requestValidation.validateResource(opportunityId, "OpportunitiesService", "Opportunity notfound", block);
                const stageResource = yield this.httpService.requestValidation.validateResource(opportunityResource.stageId, "StagesService", "Stage not found", block);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                const allowedChanges = ["opportunityValue", "notes"];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                yield this.opportuniesService.update(opportunityId, filteredChanges);
                res.status(200).json({ message: "Opportunity updated" });
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
                const opportunityId = req.params.opportunityId;
                this.httpService.requestValidation.validateUuid(opportunityId, "opprotunityId", block);
                const opportunityResource = yield this.httpService.requestValidation.validateResource(opportunityId, "OpportunitiesService", "Opportunity notfound", block);
                const stageResource = yield this.httpService.requestValidation.validateResource(opportunityResource.stageId, "StagesService", "Stage not found", block);
                const pipelineResource = yield this.httpService.requestValidation.validateResource(stageResource.pipelineId, "PipelinesService", "Pipeline not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, pipelineResource.userId, block);
                yield this.opportuniesService.delete(opportunityId);
                res.status(200).json({ message: "Opportunity deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = OpportunitiesController;
