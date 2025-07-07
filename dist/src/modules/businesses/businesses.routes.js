"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBusinessesRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeBusinessesRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("BusinessesController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", middlewareService.verifyAdminAccount(), 
    /*
    #swagger.tags = ['Businesses']
    #swagger.path =  '/businesses/secure/create'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Create business'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createBusiness" }
            }
        }
    }
    */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource", middlewareService.verifyRoles(["owner", "admin"]), 
    /*
   #swagger.tags = ['Businesses']
   #swagger.path =  '/businesses/secure/resource/{businessId}'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'Get business by id'
   */
    controller.resourceRequest.bind(controller));
    secureRouter.get("/collection", middlewareService.verifyAdminAccount(), 
    /*
   #swagger.tags = ['Businesses']
   #swagger.path =  '/businesses/secure/collection'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'Get businesses by user'
   */
    controller.collectionRequest.bind(controller));
    secureRouter.put("/", middlewareService.verifyRoles(["owner", "admin"]), 
    /*
    #swagger.tags = ['Businesses']
    #swagger.path =  '/businesses/secure/{businessId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Update business'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/updateBusiness" }
            }
        }
    }
    */
    controller.updateRequest.bind(controller));
    secureRouter.delete("/:businessId", 
    /*
    #swagger.tags = ['Businesses']
    #swagger.path =  '/businesses/secure/{businessId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Delete business'
    */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Businesses router initialized.");
    return router;
};
exports.initializeBusinessesRouter = initializeBusinessesRouter;
