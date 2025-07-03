"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEventAtendeesRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const initializeEventAtendeesRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("EventAtendeesController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    /*
       #swagger.tags = ['EventAtendees']
       #swagger.path =  '/eventAtendees/secure'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.description = 'Update eventAtendees'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: { $ref: "#/components/schemas/updateEventAtendees" }
               }
           }
       }
       */
    // protected Routes //
    // mounts //
    router.use("/secure", secureRouter);
    console.log("EventAtendees router initialized.");
    return router;
};
exports.initializeEventAtendeesRouter = initializeEventAtendeesRouter;
