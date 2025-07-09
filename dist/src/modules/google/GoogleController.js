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
class GoogleController {
    constructor(httpService, googleService) {
        this.block = "google.controller";
        this.httpService = httpService;
        this.googleService = googleService;
    }
    callback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, state } = req.query;
                if (!code || !state) {
                    throw new errors_1.BadRequestError('Missing code or state');
                }
                const client = this.googleService.clientManager.getClient();
                const redisClient = Container_1.default.resolve("RedisClient");
                const session = yield redisClient.get(`oauth_state:${state}`);
                if (!session) {
                    throw new errors_1.BadRequestError('Invalid or expired state');
                }
                ;
                // Exchange authorization code for access token
                const { tokens } = yield client.getToken(code);
                console.log(tokens);
                client.setCredentials(tokens);
                if (!tokens.refresh_token) {
                    throw new errors_1.BadRequestError("Google authorization failed");
                }
                const encryptionService = Container_1.default.resolve("EncryptionService");
                const sessionData = {
                    refreshToken: encryptionService.encryptData(tokens.refresh_token),
                };
                yield redisClient.setEx(`oauth_state:${state}`, 900, JSON.stringify(sessionData));
                res.status(200).send();
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    getUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = this.googleService.clientManager.getClient();
                const url = this.googleService.getUrl(client);
                res.status(200).json({
                    url: url
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = GoogleController;
