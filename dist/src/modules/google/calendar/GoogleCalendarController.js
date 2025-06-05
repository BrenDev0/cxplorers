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
class GoogleCalendarController {
    constructor(httpService, googleService) {
        this.block = "google.controller";
        this.httpService = httpService;
        this.googleService = googleService;
    }
    handleCalendarNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const headers = req.headers;
                console.log(headers);
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
                const client = yield this.googleService.clientManager.getcredentialedClient(resource.userId);
                const events = yield this.googleService.calendarService.listEvents(resource.calendarReferenceId, client);
                yield this.googleService.calendarService.updateCalendar(resource.calendarId, events);
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
                const client = yield this.googleService.clientManager.getcredentialedClient(resource.userId);
                const accessToken = client.credentials.access_token;
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
                const client = yield this.googleService.clientManager.getcredentialedClient(resource.userId);
                const accessToken = client.credentials.access_token;
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
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
                const calendars = yield this.googleService.calendarService.listCalendars(client);
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
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
                this.httpService.requestValidation.validateUuid(calendarId, "calenderId", block);
                const calendarService = Container_1.default.resolve("CalendarsService");
                const resource = yield calendarService.resource(calendarId);
                if (!resource) {
                    throw new errors_1.NotFoundError();
                }
                const data = yield this.googleService.calendarService.listEvents(resource.calendarReferenceId, client);
                res.status(200).json({ data: data });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = GoogleCalendarController;
