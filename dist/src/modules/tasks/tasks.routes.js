"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTasksRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeTasksRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("TasksController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", middlewareService.verifyRoles(["admin", "owner"]), 
    /*
    #swagger.tags = ['Tasks']
    #swagger.path =  '/tasks/secure/create'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'create task'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/createTask" }
            }
        }
    }
    */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource/:taskId", 
    /*
    #swagger.tags = ['Tasks']
    #swagger.path =  '/tasks/secure/resource/{taskId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get task by id'
    */
    controller.resourceRequest.bind(controller));
    secureRouter.get("/collection", 
    /*
    #swagger.tags = ['Tasks']
    #swagger.path =  '/tasks/secure/collection'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'get taks by user or by business'
    #swagger.parameters['col'] = {
        in: 'query',
        description: 'column name for db search user || business',
        type: 'string',
        required: true
    */
    controller.collectionRequest.bind(controller));
    secureRouter.put("/:taskId", middlewareService.verifyRoles(["admin", "owner"]), 
    /*
    #swagger.tags = ['Tasks']
    #swagger.path =  '/tasks/secure/{taskId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'update task'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/updateTask" }
            }
        }
    }
    */
    controller.updateRequest.bind(controller));
    secureRouter.delete("/:taskId", middlewareService.verifyRoles(["admin", "owner"]), 
    /*
    #swagger.tags = ['Tasks']
    #swagger.path =  '/tasks/secure/{taskId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'delete task by id'
    */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Tasks router initialized.");
    return router;
};
exports.initializeTasksRouter = initializeTasksRouter;
