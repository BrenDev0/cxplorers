"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCalendarsRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeCalendarsRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("CalendarsController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", middlewareService.verifyPermissions("calendars", ["write"]), 
    /*
   #swagger.tags = ['Calendars']
   #swagger.path =  '/calendars/secure/create'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'Create calendar'
   #swagger.requestBody = {
       required: true,
       content: {
           "application/json": {
               schema: { $ref: "#/components/schemas/createCalendar" }
           }
       }
   }
   */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource/:calendarId", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
   #swagger.tags = ['Calendars']
   #swagger.path =  '/calendars/secure/resource/{calendarId}'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'get calendar by id'
   */
    controller.resourceRequest.bind(controller));
    secureRouter.get("/collection", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
   #swagger.tags = ['Calendars']
   #swagger.path =  '/calendars/secure/collection'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'get users calendars'
   */
    controller.collectionRequest.bind(controller));
    secureRouter.delete("/:calendarId", middlewareService.verifyPermissions("calendars", ["read", "write"]), 
    /*
   #swagger.tags = ['Calendars']
   #swagger.path =  '/calendars/secure/{calendarId}'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'Delete calendars'
   */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Calendars router initialized.");
    return router;
};
exports.initializeCalendarsRouter = initializeCalendarsRouter;
