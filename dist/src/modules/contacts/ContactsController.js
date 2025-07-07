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
class ContactsController {
    constructor(httpService, contactsService) {
        this.block = "contacts.controller";
        this.httpService = httpService;
        this.contactsService = contactsService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const requiredFields = ["firstName", "businessId"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                yield this.contactsService.create(req.body);
                res.status(200).json({ message: "Contact added" });
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
                const contactId = req.params.contactId;
                this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
                const resource = yield this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block);
                const businessUsersService = Container_1.default.resolve("BusinessUsersService");
                const businesses = yield businessUsersService.collection("user_id", user.user_id);
                const ids = businesses.map((business) => business.businessId);
                if (!ids.includes(resource.businessId)) {
                    throw new errors_1.AuthorizationError();
                }
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
                const businessId = req.businessId;
                const data = yield this.contactsService.collection(businessId);
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
                const contactId = req.params.contactId;
                const businessId = req.businessId;
                this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
                const resource = yield this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block);
                this.httpService.requestValidation.validateActionAuthorization(businessId, resource.businessId, block);
                const allowedChanges = ["firstName", "lastName", "email", "phone"];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                yield this.contactsService.update(contactId, filteredChanges);
                res.status(200).json({ message: "Contact updated" });
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
                const contactId = req.params.contactId;
                this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
                const resource = yield this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block);
                yield this.contactsService.delete(contactId);
                res.status(200).json({ message: "Contact deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = ContactsController;
