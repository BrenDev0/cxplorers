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
class EventAttendeesService {
    constructor(repository) {
        this.block = "eventAtendees.service";
        this.repository = repository;
    }
    create(eventAttendee) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedEventAttendee = this.mapToDb(eventAttendee);
            try {
                return this.repository.create(mappedEventAttendee);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedEventAttendee);
                throw error;
            }
        });
    }
    upsert(eventAttendees) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedEventAttendees = eventAttendees.map((eventAttendee) => this.mapToDb(eventAttendee));
            const cols = Object.keys(mappedEventAttendees[0]);
            const values = mappedEventAttendees.flatMap(eventAttendee => cols.map(col => { var _a; return (_a = eventAttendee[col]) !== null && _a !== void 0 ? _a : null; }));
            try {
                const result = yield this.repository.upsert(cols, values);
                return result;
            }
            catch (error) {
                console.log(error);
                (0, error_service_1.handleServiceError)(error, this.block, "upsert", {
                    cols,
                    values
                });
                throw error;
            }
        });
    }
    resource(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne(whereCol, identifier);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { whereCol, identifier });
                throw error;
            }
        });
    }
    collection(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select(whereCol, identifier);
                return result.map((attendee) => this.mapFromDb(attendee));
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { whereCol, identifier });
                throw error;
            }
        });
    }
    read(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.getAll(businessId);
                return result;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "read", { businessId });
                throw error;
            }
        });
    }
    // async update(changes: EventAtendeeData): Promise<EventAtendee> {
    //     const mappedChanges = this.mapToDb(changes);
    //     const cleanedChanges = Object.fromEntries(
    //         Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
    //     );
    //     try {
    //         return await this.repository.update();
    //     } catch (error) {
    //         handleServiceError(error as Error, this.block, "update", cleanedChanges)
    //         throw error;
    //     }
    // }
    // async delete(whereCol: string, identifier: string): Promise<EventAtendee> {
    //     try {
    //         return await this.repository.delete(whereCol, ) as EventAtendee;
    //     } catch (error) {
    //         handleServiceError(error as Error, this.block, "delete")
    //         throw error;
    //     }
    // }
    deleteEventAttendees(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("event_id", eventId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { eventId });
                throw error;
            }
        });
    }
    deleteOne(contactId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.deleteOne(contactId, eventId);
                return result;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "deleteOne", { eventId });
                throw error;
            }
        });
    }
    handleAttendees(attendees) {
        return __awaiter(this, void 0, void 0, function* () {
            const encryptionService = Container_1.default.resolve("EncryptionService");
            const contactsService = Container_1.default.resolve("ContactsService");
            try {
                const contacts = yield contactsService.upsert(attendees, "email");
                const upsertData = attendees.map((attendee) => {
                    const contactReference = contacts.find((contact) => contact.email === encryptionService.encryptData(attendee.email));
                    return {
                        event_id: attendee.eventId,
                        contact_id: contactReference === null || contactReference === void 0 ? void 0 : contactReference.contact_id,
                        status: attendee.status
                    };
                });
                const cols = Object.keys(upsertData[0]);
                const values = upsertData.flatMap(attendee => cols.map(col => attendee[col]));
                const result = yield this.repository.upsert(cols, values);
                return result;
            }
            catch (error) {
                console.log(error);
                (0, error_service_1.handleServiceError)(error, this.block, "upsert", { attendees });
                throw error;
            }
        });
    }
    mapToDb(eventAttendee) {
        return {
            event_id: eventAttendee.eventId,
            contact_id: eventAttendee.contactId,
            status: eventAttendee.status
        };
    }
    mapFromDb(eventAttendee) {
        return {
            eventId: eventAttendee.event_id,
            contactId: eventAttendee.contact_id,
            status: eventAttendee.status
        };
    }
}
exports.default = EventAttendeesService;
