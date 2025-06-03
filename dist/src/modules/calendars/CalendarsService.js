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
class CalendarService {
    constructor(repository) {
        this.block = "calendars.service";
        this.repository = repository;
    }
    create(calendar) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedCalendar = this.mapToDb(calendar);
            try {
                return this.repository.create(mappedCalendar);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedCalendar);
                throw error;
            }
        });
    }
    resource(calendarId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("calendar_id", calendarId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource", { calendarId });
                throw error;
            }
        });
    }
    collection(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.select("user_id", userId);
                const data = result.map((calendar) => this.mapFromDb(calendar));
                return data;
            }
            catch (error) {
                console.log(error, "ERROR:::::::::::::::");
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { userId });
                throw error;
            }
        });
    }
    update(calendarId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update("calendar_id", calendarId, cleanedChanges);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete(calendarId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete("calendar_id", calendarId);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete", { calendarId });
                throw error;
            }
        });
    }
    mapToDb(calendar) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            user_id: calendar.userId,
            reference_id: calendar.referenceId && encryptionService.encryptData(calendar.referenceId),
            title: calendar.title,
            description: calendar.description || null,
            background_color: calendar.backgroundColor || null,
            foreground_color: calendar.foregroundColor || null
        };
    }
    mapFromDb(calendar) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            userId: calendar.user_id,
            referenceId: encryptionService.decryptData(calendar.reference_id),
            title: calendar.title,
            description: calendar.description,
            backgroundColor: calendar.background_color,
            foregroundColor: calendar.foreground_color
        };
    }
}
exports.default = CalendarService;
