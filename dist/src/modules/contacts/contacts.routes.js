"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeContactsRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeContactsRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("ContactsController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", 
    /*
    #swagger.tags = ['Contacts']
    #swagger.path =  '/contacts/secure/create'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'create contact'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createContact" }
            }
        }
    }
    */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource/:contactId", 
    /*
    #swagger.tags = ['Contacts']
    #swagger.path =  '/contacts/secure/resource/{contactId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get contact by id'
    */
    controller.resourceRequest.bind(controller));
    secureRouter.get("/collection", 
    /*
    #swagger.tags = ['Contacts']
    #swagger.path =  '/contacts/secure/collection'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get users contacts'
    */
    controller.collectionRequest.bind(controller));
    secureRouter.put("/:contactId", 
    /*
    #swagger.tags = ['Contacts']
    #swagger.path =  '/contacts/secure/{contactId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'update contact'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/updateContact" }
            }
        }
    }
    */
    controller.updateRequest.bind(controller));
    secureRouter.delete("/:contactId", 
    /*
        #swagger.tags = ['Contacts']
        #swagger.path =  '/contacts/secure/{contactId}'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.description = 'deletecontact'
        */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Contacts router initialized.");
    return router;
};
exports.initializeContactsRouter = initializeContactsRouter;
