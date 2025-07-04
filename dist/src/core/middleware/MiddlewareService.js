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
const Container_1 = __importDefault(require("../dependencies/Container"));
class MiddlewareService {
    constructor(httpService, usersService, errorHanlder) {
        this.httpService = httpService;
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
                const decodedToken = this.httpService.webtokenService.decodeToken(token);
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
                this.httpService.requestValidation.validateUuid(decodedToken.userId, "userId", "middleware.auth.user");
                const user = yield this.usersService.resource("user_id", decodedToken.userId);
                if (!user) {
                    throw new errors_1.AuthorizationError("Forbidden", {
                        reason: "No user found",
                        user: user
                    });
                }
                if (decodedToken.businessId) {
                    this.httpService.requestValidation.validateUuid(decodedToken.businessId, "businessId", "middleware.auth.business");
                    const businessUser = yield this.getBusinessUser(user.user_id, decodedToken.businessId);
                    if (!businessUser) {
                        throw new errors_1.AuthorizationError("Forbidden", {
                            reason: "No business user found"
                        });
                    }
                    const permissions = yield this.getUserPermissions(businessUser.businessUserId);
                    req.user = user;
                    req.businessId = decodedToken.businessId;
                    req.permissions = permissions;
                    req.role = businessUser.accountType;
                    return next();
                }
                ;
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
                const decodedToken = this.httpService.webtokenService.decodeToken(token);
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
    verifyRoles(allowed) {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const role = req.role;
                if (!role || !allowed.includes(role)) {
                    throw new errors_1.AuthorizationError(undefined, {
                        block: "middleware.verifyRoles",
                    });
                }
                return next();
            }
            catch (error) {
                return next(error);
            }
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
    getBusinessUser(userId, businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const businessUsersService = Container_1.default.resolve("BusinessUsersService");
                const businessUser = yield businessUsersService.selectByIds(userId, businessId);
                return businessUser;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getUserPermissions(businessUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const permissionsService = Container_1.default.resolve("PermissionsService");
            const permissions = yield permissionsService.collection(businessUserId);
            return permissions;
        });
    }
}
exports.default = MiddlewareService;
