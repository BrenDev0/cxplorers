"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.NotFoundError = exports.InvalidIdError = exports.S3Error = exports.DatabaseError = exports.ENVVariableError = exports.BadRequestError = exports.AuthorizationError = exports.AuthenticationError = void 0;
const AppError_1 = __importDefault(require("./AppError"));
class AuthenticationError extends AppError_1.default {
    constructor(message = 'Authentication failed', context) {
        super(message, 401, true, context);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError_1.default {
    constructor(message = 'You are not authorized to perform this action', context) {
        super(message, 403, true, context);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class BadRequestError extends AppError_1.default {
    constructor(message = 'Bad request', context) {
        super(message, 400, true, context);
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
class ENVVariableError extends AppError_1.default {
    constructor(message = 'Bad request', context) {
        super(message, 500, false, context);
        this.name = 'ENVVariableError';
    }
}
exports.ENVVariableError = ENVVariableError;
class DatabaseError extends AppError_1.default {
    constructor(message = 'Database operation failed', context) {
        super(message, 500, false, context);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class S3Error extends AppError_1.default {
    constructor(message = 'Database operation failed', context) {
        super(message, 500, false, context);
        this.name = 'S3Error';
    }
}
exports.S3Error = S3Error;
class InvalidIdError extends AppError_1.default {
    constructor(message = 'Invalid ID format', context) {
        super(message, 400, true, context);
        this.name = 'InvalidIdError';
    }
}
exports.InvalidIdError = InvalidIdError;
class NotFoundError extends AppError_1.default {
    constructor(message = 'Resource not found', context) {
        super(message, 404, true, context);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError_1.default {
    constructor(message = 'Validation failed', context) {
        super(message, 400, true, context);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
