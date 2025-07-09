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
class TagsController {
    constructor(httpService, tagsService) {
        this.block = "tags.controller";
        this.httpService = httpService;
        this.tagsService = tagsService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const requiredFields = ["tag"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const tagData = Object.assign(Object.assign({}, req.body), { businessId });
                yield this.tagsService.create(tagData);
                res.status(200).json({ message: "Tag added" });
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
                const businessId = req.businessId;
                const tagId = req.params.tagId;
                this.httpService.requestValidation.validateUuid(tagId, "tagId", block);
                const tagResource = yield this.httpService.requestValidation.validateResource(tagId, "TagsService", "Tag not found", block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
                res.status(200).json({ data: tagResource });
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
                const businessId = req.businessId;
                const data = yield this.tagsService.collection(businessId);
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
                const businessId = req.businessId;
                const tagId = req.params.tagId;
                this.httpService.requestValidation.validateUuid(tagId, "tagId", block);
                const tagResource = yield this.httpService.requestValidation.validateResource(tagId, "TagsService", "Tag not found", block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
                const allowedChanges = ["tag"];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                yield this.tagsService.update(tagId, filteredChanges);
                res.status(200).json({ message: "Tag updated" });
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
                const businessId = req.businessId;
                const tagId = req.params.tagId;
                this.httpService.requestValidation.validateUuid(tagId, "tagId", block);
                const tagResource = yield this.httpService.requestValidation.validateResource(tagId, "TagsService", "Tag not found", block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
                yield this.tagsService.delete(tagId);
                res.status(200).json({ message: "Tag deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = TagsController;
