"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeGoogleRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeGoogleRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const calendarController = Container_1.default.resolve("GoogleCalendarController");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("GoogleController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // general //
    secureRouter.get("/url", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/url'
    #swagger.description = 'get google auth href'
    */
    controller.getUrl.bind(controller));
    // calendar //
    secureRouter.get("/calendars", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars'
    #swagger.description = 'get users calendars from drive'
    */
    calendarController.getCalendars.bind(controller));
    // sync //
    secureRouter.get("/calendars/sync/:calendarId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars/sync/{calendarId}'
    #swagger.description = 'sync users calendar'
    */
    calendarController.syncCalendar.bind(calendarController));
    secureRouter.delete("/calendars/sync/:calendarId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars/sync/{calendarId}'
    #swagger.description = 'unSync users calendar'
    */
    calendarController.unSyncCalendar.bind(calendarController));
    // events //
    secureRouter.post("/calendars/events/:calendarId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/secure/calendars/events/{calendarId}'
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
    calendarController.createEventRequest.bind(calendarController));
    secureRouter.put("/calendars/events/:eventId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/secure/calendars/events/{calendarId}'
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
    calendarController.updateEventRequest.bind(calendarController));
    secureRouter.delete("/calendars/events/:eventId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars/events/{eventId}'
    #swagger.description = 'delete an event'
    */
    calendarController.deleteEventRequest.bind(calendarController));
    // secureRouter.get("/calendars/events/:calendarId", 
    //     /*
    //     #swagger.tags = ['Google'] 
    //      #swagger.security = [{ "bearerAuth": [] }]
    //     #swagger.path = '/google/secure/calendars/events/{calendarId}' 
    //     #swagger.description = 'get users calendars events'
    //     */
    //     calendarController.getCalendarEvents.bind(calendarController)
    // )
    // for google use //
    router.get("/callback", 
    // #swagger.ignore = true    
    controller.callback.bind(controller));
    router.post("/calendars/notifications", calendarController.handleCalendarNotifications.bind(calendarController));
    // mounts // 
    router.use("/secure", secureRouter);
    console.log("Google router initialized.");
    return router;
};
exports.initializeGoogleRouter = initializeGoogleRouter;
