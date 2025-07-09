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
const error_service_1 = require("../../core/errors/error.service");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const googleapis_1 = require("googleapis");
class GoogleClientManager {
    constructor(repository) {
        this.block = "google.service.clientManager";
        this.repository = repository;
    }
    getClient() {
        const client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        return client;
    }
    getcredentialedClient(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
            const user = yield this.getUser(businessId);
            client.setCredentials({
                refresh_token: user.refresh_token
            });
            const accessToken = yield this.refreshAccessToken(client);
            client.setCredentials({
                access_token: accessToken
            });
            return client;
        });
    }
    refreshAccessToken(oauth2Client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = yield oauth2Client.getAccessToken();
                return token;
            }
            catch (error) {
                console.error('Error refreshing access token', error);
                throw error;
            }
        });
    }
    getUser(businessId) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.getUser`;
            try {
                const data = yield this.repository.getGoogleUser(businessId);
                return this.mapGoogleUser(data);
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "getUser", { businessId });
                throw error;
            }
        });
    }
    mapGoogleUser(user) {
        const encryptionService = Container_1.default.resolve("EncryptionService");
        return {
            refresh_token: user.refresh_token && encryptionService.decryptData(user.refresh_token)
        };
    }
}
exports.default = GoogleClientManager;
