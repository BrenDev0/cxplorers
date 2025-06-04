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
    router.get("/callback", 
    // #swagger.ignore = true    
    controller.callback.bind(controller));
    // calendar //
    secureRouter.get("/calendars/sync/:calendarId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars/sync/{calendarId}'
    #swagger.description = 'sync users calendar'
    */
    controller.syncCalendar.bind(controller));
    secureRouter.delete("/calendars/sync/:calendarId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars/sync/{calendarId}'
    #swagger.description = 'unSync users calendar'
    */
    controller.unSyncCalendar.bind(controller));
    secureRouter.get("/calendars", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars'
    #swagger.description = 'get users calendars from drive'
    */
    controller.getCalendars.bind(controller));
    secureRouter.get("/calendars/events/:calendarId", 
    /*
    #swagger.tags = ['Google']
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars/events/{calendarId}'
    #swagger.description = 'get users calendars from drive'
    */
    controller.getCalendarEvents.bind(controller));
    secureRouter.get("/calendars/events/:calendarId", 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/calendars/events/{calendarId}'
    #swagger.description = 'get users calendars from drive'
    */
    controller.getCalendarEvents.bind(controller));
    // for google use //
    router.post("/calendars/notifications", controller.handleCalendarNotifications.bind(controller));
    // mounts // 
    router.use("/secure", secureRouter);
    console.log("Google router initialized.");
    return router;
};
exports.initializeGoogleRouter = initializeGoogleRouter;
