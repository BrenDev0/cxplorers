"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePipelinesRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializePipelinesRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("PipelinesController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", 
    /*
  #swagger.tags = ['Pipelines']
  #swagger.path =  '/pipelines/secure/create'
  #swagger.security = [{ "bearerAuth": [] }]
  #swagger.description = 'create pipeline, stages field is optional'
  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: { $ref: "#/components/schemas/createPipeline" }
          }
      }
  }
  */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource/:pipelineId", 
    /*
   #swagger.tags = ['Pipelines']
   #swagger.path =  '/pipelines/secure/resource/{pipelineId}'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'get pipeline by id'
   */
    controller.resourceRequest.bind(controller));
    secureRouter.put("/:pipelineId", 
    /*
   #swagger.tags = ['Pipelines']
   #swagger.path =  '/pipelines/secure/{piplineId}'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'Update pipelines'
   #swagger.requestBody = {
       required: true,
       content: {
           "application/json": {
               schema: { $ref: "#/components/schemas/updatePipeline" }
           }
       }
   }
   */
    controller.updateRequest.bind(controller));
    secureRouter.delete("/:pipelineId", 
    /*
    #swagger.tags = ['Pipelines']
    #swagger.path =  '/pipelines/secure/{pipelineId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'delete pipeline by id'
    */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Pipelines router initialized.");
    return router;
};
exports.initializePipelinesRouter = initializePipelinesRouter;
