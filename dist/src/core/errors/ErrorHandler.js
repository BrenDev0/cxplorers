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
// error-handler.ts
const winston_1 = __importDefault(require("winston"));
const AppError_1 = __importDefault(require("./AppError"));
const ErrorTransport_1 = __importDefault(require("./ErrorTransport"));
class ErrorHandler {
    constructor(pool, logger) {
        this.pool = pool;
        this.logger = logger !== null && logger !== void 0 ? logger : this.createDefaultLogger();
    }
    createDefaultLogger() {
        const logger = winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [
                new ErrorTransport_1.default({
                    pool: this.pool,
                    level: 'error',
                    tableName: 'error_logs',
                    serviceName: "platform"
                }),
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format(info => {
                        delete info.stack; // Strip stack trace
                        return info;
                    })(), winston_1.default.format.simple())
                })
            ]
        });
        return logger;
    }
    handleError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (error instanceof AppError_1.default) {
                    yield this.handleAppError(error);
                }
                else if (error instanceof Error) {
                    yield this.handleGenericError(error);
                }
                else {
                    yield this.handleUnknownError(error);
                }
            }
            catch (loggingError) {
                console.error('Failed to log error:', loggingError);
            }
        });
    }
    handleAppError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            const logData = {
                level: error.isOperational ? 'warn' : 'error',
                name: error.name,
                message: error.message,
                stack: error.stack,
                context: error.context,
                isOperational: error.isOperational,
            };
            this.logger.log(logData);
        });
    }
    handleGenericError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.error({
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        });
    }
    handleUnknownError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.error({
                error: String(error),
            });
        });
    }
    isTrustedError(error) {
        return error instanceof AppError_1.default && error.isOperational;
    }
    queryLogs(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: `SELECT * FROM error_logs 
             WHERE ($1::timestamptz IS NULL OR timestamp >= $1)
             AND ($2::text IS NULL OR level = $2)
             ORDER BY timestamp DESC
             LIMIT $3`,
                values: [options.since, options.level, options.limit || 100]
            };
            const result = yield this.pool.query(query);
            return result.rows;
        });
    }
}
exports.default = ErrorHandler;
