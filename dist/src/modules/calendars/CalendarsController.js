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
const Controller_1 = __importDefault(require("../../core/class/Controller"));
const errors_1 = require("../../core/errors/errors");
class CalendarsController extends Controller_1.default {
    constructor(calendarsService) {
        super();
        this.block = "calendars.controller";
        this.calendarsService = calendarsService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const {} = req.body;
                if () {
                    throw new errors_1.BadRequestError(undefined, {
                        block: `${block}.dataValidation`,
                        request: req.body,
                    });
                }
                const calendarData = {};
                yield this.calendarsService.create(calendarData);
                res.status(200).json({ message: " added." });
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
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateRequest(req, res) {
        const _super = Object.create(null, {
            filterUpdateRequest: { get: () => super.filterUpdateRequest }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateRequest`;
            try {
                const resource = yield this.calendarsService.resource();
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        block: `${block}.notFound`,
                    });
                }
                const allowedChanges = [""];
                const filteredChanges = _super.filterUpdateRequest.call(this, allowedChanges, req.body, block);
                yield this.calendarsService.update(filteredChanges);
                res.status(200).json({ message: "" });
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
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = CalendarsController;
