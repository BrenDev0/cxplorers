"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTagsRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeTagsRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("TagsController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", middlewareService.verifyPermissions("tags", ["write"]), 
    /*
    #swagger.tags = ['Tags']
    #swagger.path =  '/tags/secure/create'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Create tags'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createTag" }
            }
        }
    }
    */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource/:tagId", middlewareService.verifyPermissions("tags", ["read", "write"]), 
    /*
    #swagger.tags = ['Tags']
    #swagger.path =  '/tags/secure/resource/{tagId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get tag by id'
    */
    controller.resourceRequest.bind(controller));
    secureRouter.get("/collection", 
    /*
    #swagger.tags = ['Tags']
    #swagger.path =  '/tags/secure/collection'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get tags by buisness'
    */
    controller.collectionRequest.bind(controller));
    secureRouter.put("/:tagId", middlewareService.verifyPermissions("tags", ["write"]), 
    /*
    #swagger.tags = ['Tags']
    #swagger.path =  '/tags/secure/{tagId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Update tags'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/updateTag" }
            }
        }
    }
    */
    controller.updateRequest.bind(controller));
    secureRouter.delete("/:tagId", middlewareService.verifyPermissions("tags", ["write"]), 
    /*
    #swagger.tags = ['Tags']
    #swagger.path =  '/tags/secure/{tagId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'delete tag by id'
    */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Tags router initialized.");
    return router;
};
exports.initializeTagsRouter = initializeTagsRouter;
