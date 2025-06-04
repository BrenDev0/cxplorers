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
    constructor(httpService, client, googleService) {
        this.block = "google.controller";
        this.filterOptions = {
            SHEET: "sheet",
            FOLDER: "folder"
        };
        this.httpService = httpService;
        this.client = client;
        this.googleService = googleService;
    }
    callback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code, state } = req.query;
            if (!code || !state) {
                throw new errors_1.BadRequestError('Missing code or state');
            }
            const redisClient = Container_1.default.resolve("RedisClient");
            const session = yield redisClient.get(`oauth_state:${state}`);
            if (!session) {
                throw new errors_1.BadRequestError('Invalid or expired state');
            }
            ;
            // Exchange authorization code for access token
            const { tokens } = yield this.client.getToken(code);
            this.client.setCredentials(tokens);
            if (!tokens.refresh_token) {
                throw new errors_1.BadRequestError("Google authorization failed");
            }
            const encryptionService = Container_1.default.resolve("EncryptionService");
            const sessionData = {
                refreshToken: encryptionService.encryptData(tokens.refresh_token),
            };
            console.log(tokens);
            yield redisClient.setEx(`oauth_state:${state}`, 900, JSON.stringify(sessionData));
            res.redirect(`https://broker-app-pearl.vercel.app/account/create/${state}`);
        });
    }
    getUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = this.googleService.getUrl(this.client);
                res.status(200).json({
                    url: url
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    credentializeClient(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.googleService.getUser(userId);
            this.client.setCredentials({
                refresh_token: user.refresh_token
            });
            const accessToken = yield this.googleService.refreshAccessToken(this.client);
            this.client.setCredentials({
                access_token: accessToken
            });
            return user;
        });
    }
    //calendar //
    handleCalendarNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const headers = req.headers;
                const calendarsService = Container_1.default.resolve("CalendarsService");
                const channelId = headers['x-goog-channel-id'];
                if (!channelId) {
                    res.status(200).send();
                    return;
                }
                const encryptedChannelId = this.httpService.encryptionService.encryptData(channelId);
                const resource = yield calendarsService.findByChannel(encryptedChannelId);
                if (!resource) {
                    res.status(404).send();
                    return;
                }
                ;
                yield this.credentializeClient(resource.userId);
                const events = yield this.googleService.calendarService.listEvents(resource.calendarReferenceId, this.client);
                res.status(200).send();
            }
            catch (error) {
                throw error;
            }
        });
    }
    syncCalendar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.syncCalendar`;
            try {
                const calendarId = req.params.calendarId;
                const user = req.user;
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                const calendarService = Container_1.default.resolve("CalendarsService");
                const resource = yield calendarService.resource(calendarId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        calendarId,
                        resource: resource || "Calnedar not found"
                    });
                }
                yield this.credentializeClient(user.user_id);
                const accessToken = this.client.credentials.access_token;
                const result = yield this.googleService.calendarService.requestCalendarNotifications(resource.calendarReferenceId, accessToken);
                const changes = {
                    watchChannel: result.watchId,
                    watchChannelResourceId: result.resourceId,
                    channelExpirationMs: result.expiration
                };
                console.log("changes::::", changes);
                yield calendarService.update(resource.calendarId, changes);
                res.status(200).json({ message: "calendar synced" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    unSyncCalendar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.syncCalendar`;
            try {
                const calendarId = req.params.calendarId;
                const user = req.user;
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                const calendarService = Container_1.default.resolve("CalendarsService");
                const resource = yield calendarService.resource(calendarId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        calendarId,
                        resource: resource || "Calendar not found"
                    });
                }
                if (!resource.watchChannel || !resource.watchChannelResourceId) {
                    throw new errors_1.BadRequestError("Calendar is not synced", {
                        resource
                    });
                }
                yield this.credentializeClient(user.user_id);
                const accessToken = this.client.credentials.access_token;
                console.log("CALENDAR IN DB::::::", resource);
                yield this.googleService.calendarService.CancelCalendarNotifications(resource.watchChannelResourceId, resource.watchChannel, accessToken);
                const changes = {
                    watchChannel: null,
                    watchChannelResourceId: null,
                    channelExpirationMs: null
                };
                yield calendarService.update(resource.calendarId, changes);
                res.status(200).json({ message: "calendar unsynced" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getCalendars(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const googleUser = yield this.credentializeClient(user.user_id);
                const calendars = yield this.googleService.calendarService.listCalendars(this.client);
                res.status(200).json({ data: calendars });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getCalendarEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.getCalendarEvents`;
            try {
                const user = req.user;
                const calendarId = req.params.calendarId;
                yield this.credentializeClient(user.user_id);
                const data = yield this.googleService.calendarService.listEvents(calendarId, this.client);
                res.status(200).json({ data: data });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = GoogleController;
