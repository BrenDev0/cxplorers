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
const AppError_1 = __importDefault(require("../errors/AppError"));
const errors_1 = require("../../core/errors/errors");
const errors_2 = require("../errors/errors");
const crypto_1 = __importDefault(require("crypto"));
const validator_1 = require("validator");
class MiddlewareService {
    constructor(webtokenService, usersService, errorHanlder) {
        this.webtokenService = webtokenService;
        this.usersService = usersService;
        this.errorHandler = errorHanlder;
    }
    auth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                if (!token) {
                    throw new errors_1.AuthenticationError(undefined, {
                        headers: req.headers
                    });
                }
                const decodedToken = this.webtokenService.decodeToken(token);
                if (!decodedToken) {
                    throw new errors_1.AuthenticationError("Invalid or expired token", {
                        token: decodedToken
                    });
                }
                ;
                if (!decodedToken.userId) {
                    throw new errors_1.AuthorizationError("Forbidden", {
                        reason: "No userId in token",
                        token: decodedToken.userId
                    });
                }
                ;
                if (!(0, validator_1.isUUID)(decodedToken.userId)) {
                    throw new errors_1.AuthorizationError("Forbidden", {
                        reason: "Invalid id",
                        userId: decodedToken.userId
                    });
                }
                const user = yield this.usersService.resource("user_id", decodedToken.userId);
                if (!user) {
                    throw new errors_1.AuthorizationError("Forbidden", {
                        reason: "No user found",
                        user: user
                    });
                }
                req.user = user;
                next();
            }
            catch (error) {
                next(error);
            }
        });
    }
    verification(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                const { code } = req.body;
                if (!token || !code) {
                    throw new errors_1.AuthenticationError(undefined, {
                        headers: req.headers,
                        body: req.body
                    });
                }
                const decodedToken = this.webtokenService.decodeToken(token);
                if (!decodedToken) {
                    throw new errors_1.AuthenticationError("Invalid or expired token", {
                        token: decodedToken
                    });
                }
                ;
                if (!decodedToken.verificationCode) {
                    throw new errors_1.AuthorizationError("Forbidden", {
                        token: decodedToken
                    });
                }
                ;
                if (decodedToken.verificationCode != code) {
                    throw new errors_1.AuthenticationError("Incorrect verification code", {
                        block: `middleware.codeValidation`,
                        code: code,
                        verificationCode: decodedToken.verificationCode
                    });
                }
                return next();
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyHMAC(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.HMAC_SECRET) {
                throw new errors_2.ENVVariableError("Missing HMAC_SECRET variable");
            }
            const secret = process.env.HMAC_SECRET;
            const hmacExcludedPaths = [""];
            const allowedDrift = 60000;
            const shouldSkip = hmacExcludedPaths.some(path => req.path.startsWith(path));
            if (shouldSkip) {
                return next();
            }
            const signature = req.headers['x-signature'];
            const payload = req.headers['x-payload'];
            if (!signature || !payload) {
                throw new errors_1.AuthorizationError(undefined, {
                    block: "HMAC verification",
                    signature: signature || "**MISSING**",
                    payload: payload || "**MISSING**"
                });
            }
            const timestamp = parseInt(payload);
            if (isNaN(timestamp) || Math.abs(Date.now() - timestamp) > allowedDrift) {
                throw new errors_1.AuthorizationError('Invalid or expired payload timestamp');
            }
            const expected = crypto_1.default
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            if (signature !== expected) {
                throw new errors_1.AuthorizationError(undefined, {
                    block: "HMAC verification",
                    signature: signature,
                    expected: expected
                });
            }
            next();
        });
    }
    handleErrors(error, req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultErrorMessage = "Unable to process request at this time";
            try {
                yield this.errorHandler.handleError(error);
                if (error instanceof AppError_1.default) {
                    res.status(error.statusCode).json(Object.assign({ success: false, message: error.statusCode === 500 ? defaultErrorMessage : error.message }, (process.env.NODE_ENV !== 'production' ? { context: error.context } : {})));
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: defaultErrorMessage,
                });
            }
            catch (loggingError) {
                console.error('Error handling failed:', loggingError);
                res.status(500).json({
                    success: false,
                    message: defaultErrorMessage,
                });
                return;
            }
        });
    }
    ;
}
exports.default = MiddlewareService;
