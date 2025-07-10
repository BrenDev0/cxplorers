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
const errors_1 = require("../../../core/errors/errors");
class TaggingsController {
    constructor(httpService, taggingsService) {
        this.block = "taggings.controller";
        this.httpService = httpService;
        this.taggingsService = taggingsService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const requiredFields = ["tagId", "contactId"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const { tagId, contactId } = req.body;
                const [tagResource, contactResource] = yield Promise.all([
                    this.httpService.requestValidation.validateResource(tagId, "TagsService", "Tag not found", block),
                    this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block)
                ]);
                this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);
                const taggingExists = yield this.taggingsService.resource(tagId, contactId);
                if (taggingExists) {
                    throw new errors_1.BadRequestError("Contact already has requested tag");
                }
                yield this.taggingsService.create(req.body);
                res.status(200).json({ message: "Tagging added" });
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
                const businessId = req.businessId;
                const allowedFilters = ["contact", "tag"];
                const query = req.query.filter;
                const identifier = req.query.identifier;
                if (!query || !identifier) {
                    throw new errors_1.BadRequestError("Invalid query");
                }
                if (!allowedFilters.includes(query)) {
                    throw new errors_1.BadRequestError("Invalid query");
                }
                this.httpService.requestValidation.validateUuid(identifier, "unknown", block);
                let filter;
                if (query === "contact") {
                    const contactResource = yield this.httpService.requestValidation.validateResource(identifier, "ContactsService", "Contact no found", block);
                    this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);
                    filter = "contact_id";
                }
                else {
                    const tagResource = yield this.httpService.requestValidation.validateResource(identifier, "TagsService", "Tag not found", block);
                    this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
                    filter = "tag_id";
                }
                const data = yield this.taggingsService.collection(filter, identifier);
                res.status(200).json({ data });
            }
            catch (error) {
                throw error;
            }
        });
    }
    // async resourceRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.resourceRequest`;
    //   try {
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    // async updateRequest(req: Request, res: Response): Promise<void> {
    //   const block = `${this.block}.updateRequest`;
    //   try { 
    //    const resource = await this.taggingsService.resource();
    //     if (!resource) {
    //       throw new NotFoundError(undefined, {
    //         block: `${block}.notFound`,
    //       });
    //     }
    //     const allowedChanges = [""];
    //     const filteredChanges = this.httpService.requestValidation.filterUpdateRequest<TaggingsData>(allowedChanges, req.body, block);
    //     await this.taggingsService.update(filteredChanges);
    //     res.status(200).json({ message: "Tagging updated" });
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    deleteRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.deleteRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const requiredFields = ["tagId", "contactId"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const { tagId, contactId } = req.body;
                const [tagResource, contactResource] = yield Promise.all([
                    this.httpService.requestValidation.validateResource(tagId, "TagsService", "Tag not found", block),
                    this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block)
                ]);
                this.httpService.requestValidation.validateActionAuthorization(businessId, tagResource.businessId, block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, contactResource.businessId, block);
                const taggingExists = yield this.taggingsService.resource(tagId, contactId);
                if (!taggingExists) {
                    throw new errors_1.BadRequestError("Tagging not found");
                }
                yield this.taggingsService.delete(tagId, contactId);
                res.status(200).json({ message: "Tagging deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = TaggingsController;
