"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleError = void 0;
const AppError_1 = __importDefault(require("../../core/errors/AppError"));
class GoogleError extends AppError_1.default {
    constructor(message = "Google API error", context) {
        super(message, 400, true, context);
        this.name = 'InvalidIdError';
    }
}
exports.GoogleError = GoogleError;
