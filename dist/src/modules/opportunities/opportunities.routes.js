"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeOpportunitiesRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeOpportunitiesRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("OpportunitiesController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", 
    /*
    #swagger.tags = ['Opportunities']
    #swagger.path =  '/opportunities/secure/create'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Create opportunity'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createOpportunity" }
            }
        }
    }
    */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource/:opportunityId", 
    /*
    #swagger.tags = ['Opportunities']
    #swagger.path =  '/opportunities/secure/resource/{opportunityId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get opportunity by id'
    */
    controller.resourceRequest.bind(controller));
    secureRouter.get("/collection/:stageId", 
    /*
    #swagger.tags = ['Opportunities']
    #swagger.path =  '/opportunities/secure/collection/{stageId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get opportunities by stage id'
    */
    controller.collectionRequest.bind(controller));
    secureRouter.put("/:opportunityId", 
    /*
    #swagger.tags = ['Opportunities']
    #swagger.path =  '/opportunities/secure/{opportunityId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'update opportunity by id'
    */
    controller.updateRequest.bind(controller));
    secureRouter.delete("/:opportunityId", 
    /*
    #swagger.tags = ['Opportunities']
    #swagger.path =  '/opportunities/secure/{opportunityId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'delete opportunity by id'
    */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Opportunities router initialized.");
    return router;
};
exports.initializeOpportunitiesRouter = initializeOpportunitiesRouter;
