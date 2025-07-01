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
                const requiredFields = ["firstName"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const contactData = Object.assign(Object.assign({}, req.body), { userId: user.user_id });
                yield this.contactsService.create(contactData);
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
                const data = yield this.contactsService.collection(user.user_id);
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
                this.httpService.requestValidation.validateUuid(contactId, "contactId", block);
                const resource = yield this.httpService.requestValidation.validateResource(contactId, "ContactsService", "Contact not found", block);
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);
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
                this.httpService.requestValidation.validateActionAuthorization(user.user_id, resource.userId, block);
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
