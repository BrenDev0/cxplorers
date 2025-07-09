"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeGoogleCalendarRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const initializeGoogleCalendarRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = Container_1.default.resolve("GoogleCalendarController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // calendar //
    secureRouter.get("/", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/calendars/secure'
    #swagger.description = 'get users calendars from drive'
    */
    controller.getCalendars.bind(controller));
    // sync //
    secureRouter.get("/sync/:calendarId", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/calendars/secure/sync/{calendarId}'
    #swagger.description = 'sync users calendar'
    */
    controller.syncCalendar.bind(controller));
    secureRouter.delete("/sync/:calendarId", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/calendars/secure/sync/{calendarId}'
    #swagger.description = 'unSync users calendar'
    */
    controller.unSyncCalendar.bind(controller));
    // events //
    secureRouter.post("/events/:calendarId", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/calendars/secure/events/{calendarId}'
    #swagger.description = 'create event for full list of parameters check: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert for parameters'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createEvent" }
            }
        }
    }
    */
    controller.createEventRequest.bind(controller));
    secureRouter.put("/events/:eventId", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/calendars/secure/events/{calendarId}'
    #swagger.description = 'update event, for full list of parameters check: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert for parameters'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createEvent" }
            }
        }
    }
    */
    controller.updateEventRequest.bind(controller));
    secureRouter.delete("/events/:eventId", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/calendars/secure/events/{eventId}'
    #swagger.description = 'delete an event'
    */
    controller.deleteEventRequest.bind(controller));
    // secureRouter.get("/calendars/events/:calendarId", 
    //     /*
    //     #swagger.tags = ['Google'] 
    //      #swagger.security = [{ "bearerAuth": [] }]
    //     #swagger.path = '/google/secure/calendars/events/{calendarId}' 
    //     #swagger.description = 'get users calendars events'
    //     */
    //     controller.getCalendarEvents.bind(controller)
    // )
    // for google use //
    router.post("/notifications", controller.handleCalendarNotifications.bind(controller));
    // mounts // 
    router.use("/secure", secureRouter);
    console.log("Google calendar router initialized.");
    return router;
};
exports.initializeGoogleCalendarRouter = initializeGoogleCalendarRouter;
