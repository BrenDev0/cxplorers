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
            const block = `${this.block}.handleNotifications`;
            try {
                const headers = req.headers;
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
                if (!resource.calendarReferenceId) {
                    throw new google_errors_1.GoogleError("Googlecalendar configuration error", {
                        block: `${this.block}.calendarReferenceIdCheck`,
                        resource: resource
                    });
                }
                const client = yield this.googleService.clientManager.getcredentialedClient(resource.userId);
                yield this.googleService.calendarService.updateCalendar(client, resource.calendarReferenceId, resource.calendarId, resource.userId);
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
                const user = req.user;
                const calendarId = req.params.calendarId;
                this.httpService.requestValidation.validateUuid(calendarId, "calendarId", block);
                const resource = yield this.platformCalendarService.resource(calendarId);
                if (!resource) {
                    throw new errors_1.NotFoundError(undefined, {
                        calendarId,
                        resource: resource || "Calendar not found"
                    });
                }
                if (resource.userId !== user.user_id) {
                    throw new errors_1.AuthorizationError(undefined, {
                        calendarUserId: resource.userId,
                        user: user.user_id
                    });
                }
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
                const result = yield this.googleService.calendarService.requestCalendarNotifications(resource.calendarReferenceId, client);
                const changes = {
                    watchChannel: result.watchId,
                    watchChannelResourceId: result.resourceId,
                    channelExpiration: result.expiration
                };
                yield this.platformCalendarService.update(resource.calendarId, changes);
                yield this.googleService.calendarService.updateCalendar(client, resource.calendarReferenceId, resource.calendarId, user.user_id);
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
                const user = req.user;
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
                if (resource.userId !== user.user_id) {
                    throw new errors_1.AuthorizationError(undefined, {
                        calendarUserId: resource.userId,
                        user: user.user_id
                    });
                }
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
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
                const data = yield this.googleService.calendarService.listEvents(client, resource.calendarReferenceId);
                res.status(200).json({ data: data });
            }
            catch (error) {
                throw error;
            }
        });
    }
    createEventRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.createEventRequest`;
            try {
                const user = req.user;
                const calendarId = req.params.calendarId;
                const requiredFields = ["startTime", "endTime", "summary"];
                // https://developers.google.com/workspace/calendar/api/v3/reference/events/insert  reference for parameters
                const event = Object.assign(Object.assign({}, req.body), { start: {
                        dateTime: req.body.startTime
                    }, end: {
                        dateTime: req.body.endTime
                    }, sendUpdates: "all" });
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
                if (calendar.userId !== user.user_id) {
                    throw new errors_1.AuthorizationError(undefined, {
                        calendarUserId: calendar.userId,
                        user: user.user_id
                    });
                }
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
                yield this.googleService.calendarService.addEvent(client, calendar.calendarReferenceId, event);
                yield this.googleService.calendarService.updateCalendar(client, calendar.calendarReferenceId, calendar.calendarId, user.user_id);
                res.status(200).json({ message: "Event added" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateEventRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateEventRequest`;
            try {
                const user = req.user;
                const eventId = req.params.eventId;
                const eventUpdates = Object.assign(Object.assign({}, req.body), { start: {
                        dateTime: req.body.startTime
                    }, end: {
                        dateTime: req.body.endTime
                    }, sendUpdates: "all" });
                this.httpService.requestValidation.validateUuid(eventId, "eventId", block);
                const eventService = Container_1.default.resolve("EventsService");
                const eventResource = yield eventService.resource(eventId);
                if (!eventResource) {
                    throw new errors_1.NotFoundError(undefined, {
                        block: `${block}.eventExistsCheck`,
                        rescource: eventResource || `No event found in db with id: ${eventId}`
                    });
                }
                if (!eventResource.calendarReferenceId) {
                    throw new google_errors_1.GoogleError("Calendar configuration error", {
                        block: `${block}.calendarReferenceCheck`,
                        rescource: eventResource
                    });
                }
                const client = yield this.googleService.clientManager.getcredentialedClient(user.user_id);
                yield this.googleService.calendarService.updateEvent(client, eventResource.calendarReferenceId, eventResource.eventReferenceId, eventUpdates);
                yield this.googleService.calendarService.updateCalendar(client, eventResource.calendarReferenceId, eventResource.calendarId, user.user_id);
                res.status(200).json({ message: "Event deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteEventRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.deleteEventRequest`;
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
                yield this.googleService.calendarService.updateCalendar(client, resource.calendarReferenceId, resource.calendarId, user.user_id);
                res.status(200).json({ message: "Event deleted" });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = GoogleCalendarController;
