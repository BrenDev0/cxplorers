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
const googleapis_1 = require("googleapis");
const google_errors_1 = require("../google.errors");
const uuid_1 = require("uuid");
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const AppError_1 = __importDefault(require("../../../core/errors/AppError"));
class GoogleCalendarService {
    constructor() {
        this.block = "google.services.calendar";
    }
    listCalendars(oauth2Client) {
        return __awaiter(this, void 0, void 0, function* () {
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
            const res = yield calendar.calendarList.list();
            const calendars = res.data.items;
            if (!calendars || calendars.length === 0) {
                throw new errors_1.NotFoundError("no calendars found in google drive");
            }
            return calendars.filter((calendar) => calendar.accessRole === 'owner');
        });
    }
    updateCalendar(oauth2Client, calendarReferenceId, calendarId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateCalendar`;
            try {
                const events = yield this.listEvents(oauth2Client, calendarReferenceId);
                const eventsService = Container_1.default.resolve("EventsService");
                const mappedEvents = events.length !== 0 ? events.map((event) => {
                    return Object.assign(Object.assign({}, event), { calendarId: calendarId });
                }) : [];
                const encryptionService = Container_1.default.resolve("EncryptionService");
                const existingEvents = events.length !== 0 ? events.map((event) => encryptionService.encryptData(event.id)) : [];
                const [updatedEvents, deletedEvents] = yield Promise.all([
                    mappedEvents.length !== 0 && eventsService.upsert(mappedEvents),
                    existingEvents.length === 0 ? eventsService.delete("calendar_id", calendarId) : eventsService.deleteNonExistingEvents(existingEvents)
                ]);
                const eventAttendees = updatedEvents
                    ? updatedEvents.flatMap((event) => {
                        const originalEvent = events.find((i) => i.id === encryptionService.decryptData(event.event_reference_id));
                        return originalEvent && originalEvent.attendees.length !== 0
                            ? originalEvent.attendees.map((attendee) => {
                                return {
                                    eventId: event.event_id,
                                    email: attendee.email,
                                    status: attendee.responseStatus,
                                    source: "GOOGLE",
                                    userId: userId
                                };
                            })
                            : [];
                    })
                    : [];
                const eventAttendeesService = Container_1.default.resolve("EventAttendeesService");
                eventAttendees.length !== 0 && (yield eventAttendeesService.handleAttendees(eventAttendees));
                return;
            }
            catch (error) {
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
    requestCalendarNotifications(calendarReferenceId, oauth2Client) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.requesNotifications`;
            try {
                const watchId = (0, uuid_1.v4)();
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                const response = yield calendar.events.watch({
                    calendarId: calendarReferenceId,
                    requestBody: {
                        id: watchId,
                        type: 'web_hook',
                        address: `https://${process.env.HOST}/google/calendars/notifications`,
                        params: {
                            ttl: '7776000'
                        }
                    }
                });
                if (!response || !response.data) {
                    throw new google_errors_1.GoogleError("No response recieved from google");
                }
                const { resourceId, expiration } = response.data;
                if (!resourceId || !expiration) {
                    throw new google_errors_1.GoogleError('Missing resourceId or expiration from Google response');
                }
                const experationDate = new Date(Number(expiration));
                console.log("experiration:::", expiration, "experationDate:::: ", experationDate);
                return {
                    watchId,
                    resourceId,
                    expiration: experationDate.toISOString()
                };
            }
            catch (error) {
                console.log(error);
                if (error instanceof AppError_1.default) {
                    throw error;
                }
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
    CancelCalendarNotifications(channelResourceId, channelId, oauth2Client) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.cancelCalendarNotifications`;
            try {
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                yield calendar.channels.stop({
                    requestBody: {
                        id: channelId,
                        resourceId: channelResourceId,
                    },
                });
                console.log('Channel stopped successfully');
                return;
            }
            catch (error) {
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
    // events //
    listEvents(oauth2Client, calendarReferenceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.listEvents`;
            try {
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                const res = yield calendar.events.list({
                    calendarId: calendarReferenceId
                });
                const events = res.data.items;
                return events || [];
            }
            catch (error) {
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
    addEvent(oauth2Client, calendarReferenceId, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.addEvent`;
            try {
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                const response = yield calendar.events.insert({
                    calendarId: calendarReferenceId,
                    requestBody: event
                });
                return;
            }
            catch (error) {
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
    updateEvent(oauth2Client, calendarReferenceId, eventReferenceId, eventUpdates) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.updateEvent`;
            try {
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                const response = calendar.events.patch({
                    calendarId: calendarReferenceId,
                    eventId: eventReferenceId,
                    requestBody: eventUpdates
                });
                return;
            }
            catch (error) {
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
    deleteEvent(oauth2Client, calendarReferenceId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.deleteEvent`;
            try {
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                const response = calendar.events.delete({
                    calendarId: calendarReferenceId,
                    eventId: eventId
                });
                return;
            }
            catch (error) {
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
}
exports.default = GoogleCalendarService;
