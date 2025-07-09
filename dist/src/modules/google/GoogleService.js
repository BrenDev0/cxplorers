"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
class GoogleService {
    constructor(clientManager, calendarService) {
        this.block = "google.service";
        this.clientManager = clientManager;
        this.calendarService = calendarService;
    }
    getUrl(oauth2Client) {
        const scopes = [
            // Google Sheets (read/write)
            'https://www.googleapis.com/auth/spreadsheets',
            // Google Calendar (read/write)
            'https://www.googleapis.com/auth/calendar',
            // Google Drive (read/write + folder/file access)
            'https://www.googleapis.com/auth/drive',
            // Google Docs (read/write)
            'https://www.googleapis.com/auth/documents'
        ];
        const redisClient = Container_1.default.resolve("RedisClient");
        const state = crypto_1.default.randomBytes(32).toString('hex');
        redisClient.setEx(`oauth_state:${state}`, 900, 'valid'); // 15m
        const authorizationUrl = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes,
            redirect_uri: `${process.env.HOST}/google/calback`,
            include_granted_scopes: true,
            state: state
        });
        return authorizationUrl;
    }
}
exports.default = GoogleService;
