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
class CalendarsService {
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
    findByChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne("watch_channel", channelId);
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "collection", { channelId });
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
            calendar_reference_id: calendar.calendarReferenceId && encryptionService.encryptData(calendar.calendarReferenceId),
            title: calendar.title,
            description: calendar.description,
            background_color: calendar.backgroundColor,
            foreground_color: calendar.foregroundColor,
            watch_channel: calendar.watchChannel === null
                ? null
                : encryptionService.encryptData(calendar.watchChannel),
            watch_channel_resource_id: calendar.watchChannelResourceId === null
                ? null
                : encryptionService.encryptData(calendar.watchChannelResourceId),
            channel_expiration_ms: calendar.channelExpirationMs
        };
    }
    mapFromDb(calendar) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            calendarId: calendar.calendar_id,
            userId: calendar.user_id,
            calendarReferenceId: encryptionService.decryptData(calendar.calendar_reference_id),
            title: calendar.title,
            description: calendar.description,
            backgroundColor: calendar.background_color,
            foregroundColor: calendar.foreground_color,
            watchChannel: calendar.watch_channel && encryptionService.decryptData(calendar.watch_channel),
            watchChannelResourceId: calendar.watch_channel_resource_id && encryptionService.decryptData(calendar.watch_channel_resource_id),
            channelExpirationMs: calendar.channel_expiration_ms
        };
    }
}
exports.default = CalendarsService;
