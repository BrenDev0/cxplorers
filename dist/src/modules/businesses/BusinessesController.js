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
const errors_1 = require("../../core/errors/errors");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
class BusinessesController {
    constructor(httpService, businessesService) {
        this.block = "businesses.controller";
        this.httpService = httpService;
        this.businessesService = businessesService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const user = req.user;
                const requiredFields = ["legalName", "businessEmail"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const newBusiness = yield this.businessesService.create(req.body);
                const businessUsersService = Container_1.default.resolve("BusinessUsersService");
                const businessUserData = {
                    userId: user.user_id,
                    businessId: newBusiness.business_id,
                    role: "owner"
                };
                yield businessUsersService.create(businessUserData);
                const token = this.httpService.webtokenService.generateToken({
                    userId: user.user_id,
                    businessId: newBusiness.business_id
                }, "7d");
                res.status(200).json({ message: "Business added.", token });
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
                const businessId = req.businessId;
                this.httpService.requestValidation.validateUuid(businessId, "businessId", block);
                const businessResource = yield this.httpService.requestValidation.validateResource(businessId, "BusinessesService", "Business not found", block);
                res.status(200).json({ data: businessResource });
            }
            catch (error) {
                throw error;
            }
        });
    }
    collectionRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const businessUsersService = Container_1.default.resolve("BusinessUsersService");
                let usersBusinesses = yield businessUsersService.collection("user_id", user.user_id);
                if (usersBusinesses.length === 0) {
                    res.status(200).json({ data: [] });
                    return;
                }
                const ids = usersBusinesses.map((business) => business.businessId);
                const data = yield this.businessesService.collection(ids);
                res.status(200).json({ data: data });
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateRequest`;
            try {
                const user = req.user;
                const businessId = req.businessId;
                this.httpService.requestValidation.validateUuid(businessId, "businessId", block);
                yield this.httpService.requestValidation.validateResource(businessId, "BusinessesService", "Business not found", block);
                const allowedChanges = [
                    "businessLogo",
                    "businessName",
                    "legalName",
                    "businessEmail",
                    "businessPhone",
                    "brandedDomain",
                    "businessWebsite",
                    "businessNiche",
                    "platformLanguage",
                    "communicationLanguage",
                ];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                yield this.businessesService.update(businessId, filteredChanges);
                res.status(200).json({ message: "Business updated" });
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
                const businessId = req.businessId;
                this.httpService.requestValidation.validateUuid(businessId, "businessId", block);
                yield this.httpService.requestValidation.validateResource(businessId, "BusinessesService", "Business not found", block);
                yield this.businessesService.delete(businessId);
                const businessUsersService = Container_1.default.resolve("BusinessUsersService");
                const businesses = yield businessUsersService.collection("user_id", user.user_id);
                const tokenPayload = {
                    userId: user.user_id
                };
                if (businesses.length !== 0) {
                    tokenPayload.businessId = businesses[0].businessId;
                }
                const token = this.httpService.webtokenService.generateToken(tokenPayload, "7d");
                res.status(200).json({ message: "Business deleted", token });
            }
            catch (error) {
                throw error;
            }
        });
    }
    businessLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.businessLogin`;
            try {
                const user = req.user;
                const businessId = req.params.businessId;
                this.httpService.requestValidation.validateUuid(businessId, "businessId", block);
                const businessUsersService = Container_1.default.resolve("BusinessUsersService");
                yield this.httpService.requestValidation.validateResource(businessId, "BusinessesService", "Business not found", block);
                const businessUser = yield businessUsersService.selectByIds(user.user_id, businessId);
                if (!businessUser) {
                    throw new errors_1.AuthorizationError();
                }
                const token = this.httpService.webtokenService.generateToken({
                    userId: user.user_id,
                    businessId: businessId
                }, "7d");
                res.status(200).json({
                    token,
                    role: businessUser.role
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = BusinessesController;
