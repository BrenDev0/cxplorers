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
class ContactService {
    constructor(repository) {
        this.block = "contacts.service";
        this.repository = repository;
    }
    create(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedContact = this.mapToDb(contact);
            try {
                return this.repository.create(mappedContact);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedContact);
                throw error;
            }
        });
    }
    resource(contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("contact_id", contactId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { contactId });
                throw error;
            }
        });
    }
    collection(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("user_id", userId);
                const data = result.map((contact) => this.mapFromDb(contact));
                return data;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { userId });
                throw error;
            }
        });
    }
    update(contactId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("contact_id", contactId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("contact_id", contactId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { contactId });
                throw error;
            }
        });
    }
    mapToDb(contact) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            user_id: contact.userId,
            first_name: contact.firstName && encryptionService.encryptData(contact.firstName),
            last_name: contact.lastName && encryptionService.encryptData(contact.lastName),
            email: contact.email && encryptionService.encryptData(contact.email),
            phone: contact.phone && encryptionService.encryptData(contact.phone)
        };
    }
    mapFromDb(contact) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            contactId: contact.contact_id,
            userId: contact.user_id,
            firstName: contact.first_name && encryptionService.decryptData(contact.first_name),
            lastName: contact.last_name && encryptionService.decryptData(contact.last_name),
            email: contact.email && encryptionService.decryptData(contact.email),
            phone: contact.phone && encryptionService.decryptData(contact.phone)
        };
    }
}
exports.default = ContactService;
