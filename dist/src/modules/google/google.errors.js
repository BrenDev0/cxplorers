"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleError = void 0;
const AppError_1 = __importDefault(require("../../core/errors/AppError"));
class GoogleError extends AppError_1.default {
    constructor(message = "No pudimos leer correctamente tus archivos. Te recomendamos revisar la configuración de tu cuenta de Google en el panel de usuario.", context) {
        super(message, 400, true, context);
        this.name = 'InvalidIdError';
    }
}
exports.GoogleError = GoogleError;
