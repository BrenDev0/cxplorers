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
    secureRouter.get("/url", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
    #swagger.tags = ['Google']
     #swagger.security = [{ "bearerAuth": [] }]
    #swagger.path = '/google/secure/url'
    #swagger.description = 'get google auth href'
    */
    controller.getUrl.bind(controller));
    // secureRouter.get("/calendars/events/:calendarId", 
    //     /*
    //     #swagger.tags = ['Google'] 
    //      #swagger.security = [{ "bearerAuth": [] }]
    //     #swagger.path = '/google/secure/calendars/events/{calendarId}' 
    //     #swagger.description = 'get users calendars events'
    //     */
    //     calendarController.getCalendarEvents.bind(calendarController)
    // )
    router.get("/callback", controller.callback.bind(controller));
    // mounts // 
    router.use("/secure", secureRouter);
    console.log("Google router initialized.");
    return router;
};
exports.initializeGoogleRouter = initializeGoogleRouter;
