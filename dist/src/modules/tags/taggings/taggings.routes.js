"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTaggingsRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../../core/dependencies/Container"));
const initializeTaggingsRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("TaggingsController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", 
    /*
    #swagger.tags = ['Taggings']
    #swagger.path =  '/taggings/secure/create'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Tag a contact'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createTagging" }
            }
        }
    }
    */
    controller.createRequest.bind(controller));
    secureRouter.get("/collection", 
    /*
    #swagger.tags = ['Taggings']
    #swagger.path =  '/taggings/secure/collection'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get collection of contacts tagged or a contacts tags'
    #swagger.parameters['filter'] = {
        in: 'query',
        description: 'contact || tag',
        type: 'string',
        required: true
    }
    #swagger.parameters['identifier'] = {
        in: 'query',
        description: 'id of the tag or contact',
        type: 'string',
        required: true
    }
    */
    controller.collectionRequest.bind(controller));
    secureRouter.delete("/delete", 
    /*
    #swagger.tags = ['Taggings']
    #swagger.path =  '/taggings/secure/delete'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Tag a contact'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createTagging" }
            }
        }
    }
    */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Taggings router initialized.");
    return router;
};
exports.initializeTaggingsRouter = initializeTaggingsRouter;
