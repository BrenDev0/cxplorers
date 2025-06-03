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
const crypto_1 = __importDefault(require("crypto"));
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const error_service_1 = require("../../core/errors/error.service");
class GoogleService {
    constructor(repository) {
        this.block = "google.service";
        this.repository = repository;
    }
    getGoogleData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.repository.getGoogleUser(userId);
                return data;
            }
            catch (error) {
                (0, error_service_1.handleServiceError)(error, this.block, "update", { userId });
                throw error;
            }
        });
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
            include_granted_scopes: true,
            state: state
        });
        return authorizationUrl;
    }
    // async searchDrive(oauth2Client: OAuth2Client, filter: string, customQuery?: string) {
    //     const block = `${this.block}.SearchDrive`
    //     try {
    //         let query;
    //     switch(filter) {
    //         case "sheet":
    //             query = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
    //             break;
    //         case "folder":
    //             query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
    //             break;
    //         case "file":
    //             query = customQuery; 
    //             break;   
    //         default: 
    //             throw new Error("Invalid filter") ;   
    //     }
    //     const drive = google.drive({ version: 'v3', auth: oauth2Client });
    //     const res = await drive.files.list({
    //         q: query,
    //         fields: 'files(id, name, mimeType, webContentLink)',
    //         pageSize: 100,
    //     });
    //     return res.data.files || [];
    //     } catch (error) {
    //         throw new GoogleError(undefined, {
    //             block: block,
    //             originalError: (error as Error).message
    //         });
    //     }
    // }
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
}
exports.default = GoogleService;
