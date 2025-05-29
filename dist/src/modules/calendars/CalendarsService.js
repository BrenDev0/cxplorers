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
            const mappedCalendar = this.mapToDb(calendars);
            try {
                return this.repository.create(mappedCalendar);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "create", mappedCalendar);
                throw error;
            }
        });
    }
    resource() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.selectOne();
                if (!result) {
                    return null;
                }
                return this.mapFromDb(result);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "resource");
                throw error;
            }
        });
    }
    update(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedChanges = this.mapToDb(changes);
            const cleanedChanges = Object.fromEntries(Object.entries(mappedChanges).filter(([_, value]) => value !== undefined));
            try {
                return yield this.repository.update();
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", cleanedChanges);
                throw error;
            }
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.delete();
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "delete");
                throw error;
            }
        });
    }
    mapToDb(calendar) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {};
    }
    mapFromDb(calendar) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {};
    }
}
exports.default = CalendarService;
