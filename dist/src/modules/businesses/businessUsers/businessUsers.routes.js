"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBusinessUsersRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const initializeBusinessUsersRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("BusinessUsersController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    /*
       #swagger.tags = ['Staff']
       #swagger.path =  '/businessUsers/secure'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.description = 'Update businessUsers'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: { $ref: "#/components/schemas/updateBusinessUsers" }
               }
           }
       }
       */
    // protected Routes //
    // mounts //
    router.use("/secure", secureRouter);
    console.log("BusinessUsers router initialized.");
    return router;
};
exports.initializeBusinessUsersRouter = initializeBusinessUsersRouter;
