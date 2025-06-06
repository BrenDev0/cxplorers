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
const google_errors_1 = require("../google.errors");
class GoogleCalendarController {
    constructor(httpService, googleService, platformCalendarService) {
        this.block = "google.controller";
        this.httpService = httpService;
        this.googleService = googleService,
            this.platformCalendarService = platformCalendarService;
    }
    handleCalendarNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const headers = req.headers;
                console.log(headers);
                const channelId = headers['x-goog-channel-id'];
                if (!channelId) {
                    res.status(200).send();
                    return;
                }
                const encryptedChannelId = this.httpService.encryptionService.encryptData(channelId);
                const resource = yield this.platformCalendarService.findByChannel(encryptedChannelId);
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
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                const resource = yield this.platformCalendarService.resource(calendarId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        calendarId,
                        resource: resource || "Calendar not found"
                    });
                }
                const client = yield this.googleService.clientManager.getcredentialedClient(resource.userId);
                const result = yield this.googleService.calendarService.requestCalendarNotifications(resource.calendarReferenceId, client);
                const changes = {
                    watchChannel: result.watchId,
                    watchChannelResourceId: result.resourceId,
                    channelExpiration: result.expiration
                };
                yield this.platformCalendarService.update(resource.calendarId, changes);
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
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                const resource = yield this.platformCalendarService.resource(calendarId);
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
                yield this.googleService.calendarService.CancelCalendarNotifications(resource.watchChannelResourceId, resource.watchChannel, client);
                const changes = {
                    watchChannel: null,
                    watchChannelResourceId: null,
                    channelExpiration: null
                };
                yield this.platformCalendarService.update(resource.calendarId, changes);
                res.status(200).json({ message: "calendar unsynced" });
            }
            catch (error) {
                console.log("ERRROR uncsync:::::::::", error);
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
                const resource = yield this.platformCalendarService.resource(calendarId);
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
    createEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createEvent`;
            try {
                const user = req.user;
                const calendarId = req.params.calendarId;
                const requiredFields = ["start", "end", "summary"];
                const event = Object.assign(Object.assign({}, req.body), { start: {
                        dateTime: req.body.start
                    }, end: {
                        dateTime: req.body.end
                    } });
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                this.httpService.requestValidation.validateRequestBody(requiredFields, req.body, block);
                const calendar = yield this.platformCalendarService.resource(calendarId);
                if (!calendar) {
                    throw new errors_1.NotFoundError(undefined, {
                        block: `${block}.calendarExistsCheck`,
                        calendar: calendar || `No calendar found in db with id: ${calendarId}`
                    });
                }
                ;
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
                yield this.googleService.calendarService.addEvent(client, calendar.calendarReferenceId, event);
                res.status(200).json({ message: "Event added" });
            }
            catch (error) {
                console.log(error, "CREATE  EVENT::::::::::");
                throw error;
            }
        });
    }
    deleteEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.deleteEvent`;
            try {
                const user = req.user;
                const eventId = req.params.eventId;
                this.httpService.requestValidation.validateUuid(eventId, "eventId", block);
                const eventService = Container_1.default.resolve("EventsService");
                const resource = yield eventService.resource(eventId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        block: `${block}.eventExistsCheck`,
                        rescource: resource || `No event found in db with id: ${eventId}`
                    });
                }
                if (!resource.calendarReferenceId) {
                    throw new google_errors_1.GoogleError("Calendar configuration error", {
                        block: `${block}.calendarReferenceCheck`,
                        rescource: resource
                    });
                }
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
                yield this.googleService.calendarService.deleteEvent(client, resource.calendarReferenceId, resource.eventReferenceId);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = GoogleCalendarController;
