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
class EventsService {
    constructor(repository) {
        this.block = "events.service";
        this.repository = repository;
    }
    create(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedEvent = this.mapToDb(event);
            try {
                return this.repository.create(mappedEvent);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedEvent);
                throw error;
            }
        });
    }
    upsert(events) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedEvents = events.map((event) => this.mapToDb(event));
            const cols = Object.keys(mappedEvents[0]);
            const values = mappedEvents.flatMap(event => cols.map(col => { var _a; return (_a = event[col]) !== null && _a !== void 0 ? _a : null; }));
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
    resource(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.resource(eventId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { eventId });
                throw error;
            }
        });
    }
    collection(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("user_id", userId);
                const data = result.map((event) => this.mapFromDb(event));
                return data;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { userId });
                throw error;
            }
        });
    }
    update(eventId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("event_id", eventId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(whereCol, identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete(whereCol, identifier);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { whereCol, identifier });
                throw error;
            }
        });
    }
    deleteNonExistingEvents(existingReferenceIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.deleteMany(existingReferenceIds);
                return result;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "deleteAbsentEvents", { existingReferenceIds });
                throw error;
            }
        });
    }
    mapToDb(event) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            event_reference_id: encryptionService.encryptData(event.id),
            calendar_id: event.calendarId,
            created_at: event.created,
            updated_at: event.updated,
            summary: event.summary,
            description: event.description,
            start_time: event.start.dateTime,
            start_timezone: event.start.timeZone,
            end_time: event.end.dateTime,
            end_timezone: event.end.timeZone,
            status: event.status
        };
    }
    mapFromDb(event) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            eventId: event.event_id,
            eventReferenceId: encryptionService.decryptData(event.event_reference_id),
            calendarId: event.calendar_id,
            createdAt: event.created_at,
            updatedAt: event.updated_at,
            summary: event.summary,
            description: event.description,
            start: event.start_time,
            startTimezone: event.start_timezone,
            end: event.end_time,
            endTimezone: event.end_timezone,
            status: event.status,
            calendarReferenceId: event.calendar_reference_id && encryptionService.decryptData(event.calendar_reference_id)
        };
    }
}
exports.default = EventsService;
