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
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../core/errors/errors");
class TokensController {
    constructor(httpService, tokensService) {
        this.block = "tokens.controller";
        this.httpService = httpService;
        this.tokensService = tokensService;
    }
    createRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createRequest`;
            try {
                const { token, service, type } = req.body;
                const user = req.user;
                const requiredFields = ["token", "type", "service"];
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const usersTokens = yield this.tokensService.collection(user.user_id);
                const tokenExist = usersTokens.find((token) => token.type === type && token.service === service);
                const tokenData = Object.assign(Object.assign({}, req.body), { userId: user.user_id });
                if (tokenExist) {
                    yield this.tokensService.update(tokenExist.tokenId, tokenData);
                    res.status(200).json({ message: "Token updated" });
                    return;
                }
                yield this.tokensService.create(tokenData);
                res.status(200).json({ message: "Token added." });
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
                const tokenId = req.params.tokenId;
                this.httpService.requestValidation.validateUuid(tokenId, "tokenId", block);
                const resource = yield this.tokensService.resource(tokenId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        block: `${block}.resourceCheck`,
                        id: tokenId,
                        resource: resource || "no token found in db"
                    });
                }
                res.status(200).json({ data: resource });
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
                const tokenId = req.params.tokenId;
                this.httpService.requestValidation.validateUuid(tokenId, "tokenId", block);
                const resource = yield this.tokensService.resource(tokenId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        block: `${block}.notFound`,
                    });
                }
                if (resource.userId != user.user_id) {
                    throw new errors_1.AuthorizationError(undefined, {
                        tokenUserId: resource.userId,
                        userId: user.user_id
                    });
                }
                const allowedChanges = ["token", "type", "service"];
                const filteredChanges = this.httpService.requestValidation.filterUpdateRequest(allowedChanges, req.body, block);
                yield this.tokensService.update(tokenId, filteredChanges);
                res.status(200).json({ message: "token updated" });
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
                const tokenId = req.params.tokenId;
                this.httpService.requestValidation.validateUuid(tokenId, "tokenId", block);
                const resource = yield this.tokensService.resource(tokenId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        block: `${block}.notFound`,
                    });
                }
                if (resource.userId != user.user_id) {
                    throw new errors_1.AuthorizationError(undefined, {
                        tokenUserId: resource.userId,
                        userId: user.user_id
                    });
                }
                yield this.tokensService.delete(tokenId);
                res.status(200).json({ message: "Token deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = TokensController;
