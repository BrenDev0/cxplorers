"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeStagesRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeStagesRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("StagesController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.get("/collection/:pipelineId", 
    /*
    #swagger.tags = ['Stages']
    #swagger.path =  '/stages/secure/collection/{pipelineId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get stages by pipelineId'
    */
    controller.collectionRequest.bind(controller));
    secureRouter.delete("/:stageId", 
    /*
    #swagger.tags = ['Stages']
    #swagger.path =  '/stages/secure/{stageId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'delete stage by id'
    */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Stages router initialized.");
    return router;
};
exports.initializeStagesRouter = initializeStagesRouter;
