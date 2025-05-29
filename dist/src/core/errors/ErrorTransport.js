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
const winston_transport_1 = __importDefault(require("winston-transport"));
class ErrorTransport extends winston_transport_1.default {
    constructor(options) {
        super({ level: options.level });
        this.pool = options.pool;
        this.tableName = options.tableName;
        this.serviceName = options.serviceName;
    }
    log(info, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reults = yield this.pool.query(`INSERT INTO ${this.tableName} 
        (level, error_name, message, stack, context, is_operational, service_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                    info.level,
                    info.name,
                    info.message,
                    info.stack,
                    info.context ? JSON.stringify(info.context) : null,
                    info.isOperational || false,
                    this.serviceName
                ]);
                console.log(reults.rows);
            }
            catch (error) {
                console.error('Failed to write log to db:', error);
            }
            setImmediate(callback);
        });
    }
}
exports.default = ErrorTransport;
