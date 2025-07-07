"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePermissionsRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializePermissionsRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("PermissionsController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create/:businessUserId", middlewareService.verifyRoles(["OWNER", "ADMIN"]), 
    /*
    #swagger.tags = ['Permissions']
    #swagger.path =  '/permissions/secure/create/{businessUserId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'create permissions'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createPermission" }
            }
        }
    }
    */
    controller.createRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Permissions router initialized.");
    return router;
};
exports.initializePermissionsRouter = initializePermissionsRouter;
