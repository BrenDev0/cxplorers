"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTokensRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeTokensRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("TokensController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    // protected Routes //
    secureRouter.post("/create", 
    /*
   #swagger.tags = ['Tokens']
   #swagger.path =  '/tokens/secure/create'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'create token'
   #swagger.requestBody = {
       required: true,
       content: {
           "application/json": {
               schema: { $ref: "#/components/schemas/createToken" }
           }
       }
   }
   */
    controller.createRequest.bind(controller));
    secureRouter.get("/resource/:tokenId", 
    /*
   #swagger.tags = ['Tokens']
   #swagger.path =  '/tokens/secure/resource/{tokenId}'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'get token by id'
   */
    controller.resourceRequest.bind(controller));
    // secureRouter.put("/:tokenId",
    //      /*
    //     #swagger.tags = ['Tokens']
    //     #swagger.path =  '/tokens/secure/{tokenId}'
    //     #swagger.security = [{ "bearerAuth": [] }] 
    //     #swagger.description = 'Update token'
    //     #swagger.requestBody = {
    //         required: true,
    //         content: {
    //             "application/json": {
    //                 schema: { $ref: "#/components/schemas/updateToken" }
    //             }
    //         }
    //     }
    //     */
    //     controller.updateRequest.bind(controller)
    // )
    secureRouter.delete("/:tokenId", 
    /*
   #swagger.tags = ['Tokens']
   #swagger.path =  '/tokens/secure/{tokenId}'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'delete token by id'
   */
    controller.deleteRequest.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    console.log("Tokens router initialized.");
    return router;
};
exports.initializeTokensRouter = initializeTokensRouter;
