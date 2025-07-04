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
const errors_1 = require("../../../core/errors/errors");
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
class BusinessUsersController {
    constructor(httpService, businessUsersService) {
        this.block = "businessUsers.controller";
        this.httpService = httpService;
        this.businessUsersService = businessUsersService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                const allowedAccountTypes = ["admin", "user"];
                const requiredFields = ["email", "password", "name", "phone", "accountType"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const usersService = Container_1.default.resolve("UsersService");
                const newUser = yield usersService.create(req.body);
                const { accountType } = req.body;
                if (!allowedAccountTypes.includes(accountType)) {
                    throw new errors_1.BadRequestError("Invalid account type");
                }
                const newBusinessUser = yield this.businessUsersService.create({
                    accountType: accountType.toLowerCase(),
                    businessId,
                    userId: newUser.user_id
                });
                res.status(200).json({
                    message: "User added to business.",
                    businessUserId: newBusinessUser.business_user_id
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = BusinessUsersController;
