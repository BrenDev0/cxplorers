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
const axios_1 = __importDefault(require("axios"));
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
    listEvents(calendarReferenceId, oauth2Client) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.listEvents`;
            try {
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
                const res = yield calendar.events.list({
                    calendarId: calendarReferenceId
                });
                const events = res.data.items;
                if (!events || events.length === 0) {
                    throw new errors_1.NotFoundError("no calendars found in google drive");
                }
                return events;
            }
            catch (error) {
                throw new google_errors_1.GoogleError(undefined, {
                    block: block,
                    originalError: error.message
                });
            }
        });
    }
    requestCalendarNotifications(calendarReferenceId, calendarId, accessKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = `${this.block}.requesNotifications`;
            try {
                const response = yield axios_1.default.post(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarReferenceId)}/events/watch`, {
                    id: calendarId,
                    type: 'web_hook',
                    address: `${process.env.HOST}/calendars/notifications`,
                    params: {
                        ttl: 86400 // Optional: time in seconds (1 day)
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${accessKey}`,
                        'Content-Type': 'application/json',
                    }
                });
                console.log('Watch response:', response.data);
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
