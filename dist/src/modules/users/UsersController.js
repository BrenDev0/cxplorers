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
class UsersController extends Controller_1.default {
    constructor(usersService, emailService) {
        super();
        this.block = "users.controller";
        this.usersService = usersService;
        this.emailService = emailService;
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.verifyEmail`;
            try {
                const { email } = req.body;
                const update = req.query.update === "true";
                if (!email) {
                    throw new errors_1.BadRequestError("All fields required.", {
                        block: `${this.block}.dataValidation`,
                        request: req.body
                    });
                }
                ;
                const encryptedEmail = this.encryptionService.encryptData(email);
                const emailExists = yield this.usersService.resource("email", encryptedEmail);
                if (emailExists) {
                    throw new errors_1.BadRequestError("Email in use", {
                        block: `${block}.emailExists`,
                        email: email
                    });
                }
                const requestType = update ? "UPDATE" : "NEW";
                const token = yield this.emailService.handleRequest(email, requestType, this.webtokenService);
                res.status(200).json({
                    message: "Verification email sent.",
                    token: token
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    createRequest(req, res) {
        const _super = Object.create(null, {
            hashPassword: { get: () => super.hashPassword }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const { email, password, phone, name } = req.body;
                if (!email || !password || !phone || !name) {
                    throw new errors_1.BadRequestError(undefined, {
                        block: `${block}.dataValidation`,
                        request: req.body,
                    });
                }
                const hashedPassword = yield _super.hashPassword.call(this, password);
                const userData = {
                    email: email,
                    password: hashedPassword,
                    name: name,
                    phone: phone
                };
                yield this.usersService.create(userData);
                res.status(200).json({ message: "User added." });
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
                const user = req.user;
                const data = this.usersService.mapFromDb(user);
                res.status(200).json({ data: data });
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateRequest(req, res) {
        const _super = Object.create(null, {
            filterUpdateRequest: { get: () => super.filterUpdateRequest },
            comparePassword: { get: () => super.comparePassword },
            hashPassword: { get: () => super.hashPassword }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateRequest`;
            try {
                const user = req.user;
                const allowedChanges = ["phone", "name", "password"];
                const filteredChanges = _super.filterUpdateRequest.call(this, allowedChanges, req.body, block);
                if (req.body.password) {
                    const { password, oldPassword } = req.body;
                    if (!oldPassword) {
                        throw new errors_1.BadRequestError("Current password required for password update");
                    }
                    ;
                    const correctPassword = _super.comparePassword.call(this, oldPassword, user.password);
                    if (!correctPassword) {
                        throw new errors_1.BadRequestError("Incorrect password");
                    }
                    const hashedPassword = yield _super.hashPassword.call(this, password);
                    filteredChanges.password = hashedPassword;
                }
                yield this.usersService.update(user.user_id, filteredChanges);
                res.status(200).json({ message: "User updated" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    verifiedUpdateRequest(req, res) {
        const _super = Object.create(null, {
            validateId: { get: () => super.validateId },
            filterUpdateRequest: { get: () => super.filterUpdateRequest },
            hashPassword: { get: () => super.hashPassword }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.verifiedUpdateRequest`;
            try {
                const userId = Number(req.params.userId);
                _super.validateId.call(this, userId, "userId", block);
                const allowedChanges = ["email", "password"];
                const filteredChanges = _super.filterUpdateRequest.call(this, allowedChanges, req.body, block);
                if (filteredChanges.password) {
                    const hashedPassword = yield _super.hashPassword.call(this, filteredChanges.password);
                    filteredChanges.password = hashedPassword;
                }
                yield this.usersService.update(userId, filteredChanges);
                res.status(200).json({ message: "User updated" });
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
                const user = req.user;
                yield this.usersService.delete(user.user_id);
                res.status(200).json({ message: "User Deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    login(req, res) {
        const _super = Object.create(null, {
            comparePassword: { get: () => super.comparePassword }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.login`;
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    throw new errors_1.BadRequestError("All fields required", {
                        block: `${block}.dataValidation`,
                        request: req.body
                    });
                }
                ;
                const encryptedEmail = this.encryptionService.encryptData(email);
                const userExists = yield this.usersService.resource("email", encryptedEmail);
                if (!userExists) {
                    throw new errors_1.BadRequestError("Incorrect email or password", {
                        block: `${block}.userExists`,
                        email: email,
                        userExists: userExists
                    });
                }
                ;
                const correctPassword = yield _super.comparePassword.call(this, password, userExists.password);
                if (!correctPassword) {
                    throw new errors_1.BadRequestError("Incorrect email or password", {
                        block: `${block}.passwordValidation`,
                        correctPassword: false
                    });
                }
                ;
                const token = this.webtokenService.generateToken({
                    userId: userExists.user_id
                }, "7d");
                res.status(200).json({
                    token: token
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    accountRecoveryEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.accountRecoveryEmail`;
            try {
                const { email } = req.body;
                const encryptedEmail = this.encryptionService.encryptData(email);
                const emailExists = yield this.usersService.resource("email", encryptedEmail);
                if (!emailExists) {
                    throw new errors_1.BadRequestError("Incorrect email", {
                        block: `${block}.emailInUse`,
                        email: email
                    });
                }
                ;
                const token = yield this.emailService.handleRequest(email, "RECOVERY", this.webtokenService);
                res.status(200).json({
                    message: "Recovery email sent",
                    token: token
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = UsersController;
