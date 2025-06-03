"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeUsersRouter = void 0;
const express_1 = require("express");
const Container_1 = __importDefault(require("../../core/dependencies/Container"));
const initializeUsersRouter = (customController) => {
    const router = (0, express_1.Router)();
    const secureRouter = (0, express_1.Router)();
    const verifiedRouter = (0, express_1.Router)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    const controller = customController !== null && customController !== void 0 ? customController : Container_1.default.resolve("UsersController");
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    verifiedRouter.use(middlewareService.verification.bind(middlewareService));
    // protected Routes //
    secureRouter.get("/resource", 
    /*
   #swagger.tags = ['Users']
   #swagger.path =  '/users/secure/resource'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'Get current user'
   */
    controller.resourceRequest.bind(controller));
    secureRouter.put("/account", 
    /*
    #swagger.tags = ['Users']
    #swagger.path =  '/users/secure/account'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'update user account details, if updating password the users current password must be provided'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/updateUser" }
            }
        }
    }
    */
    controller.updateRequest.bind(controller));
    secureRouter.delete("/delete", 
    /*
    #swagger.tags = ['Users']
    #swagger.path =  '/users/secure/delete'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'Delete current user'
    */
    controller.deleteRequest.bind(controller));
    // verified //
    verifiedRouter.post("/create", 
    /*
   #swagger.tags = ['Users']
   #swagger.path =  '/users/verified/create'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.description = 'create user user. must enter the code from thier email'
   #swagger.requestBody = {
       required: true,
       content: {
           "application/json": {
               schema: { $ref: "#/components/schemas/createUser" }
           }
       }
   }
   */
    controller.createRequest.bind(controller));
    verifiedRouter.put("/account/:userId", 
    /*
    #swagger.tags = ['Users']
    #swagger.path =  '/users/verified/account/{userId}'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.description = 'update user account details with verification code. user must enter the code from thier email'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/verifiedUpdateUser" }
            }
        }
    }
    */
    controller.verifiedUpdateRequest.bind(controller));
    // unprotected //
    router.post("/login", 
    /*
    #swagger.tags = ['Users']
    #swagger.path =  '/users/login'
    #swagger.description = 'user login'
    */
    controller.login.bind(controller));
    router.post("/account-recovery", 
    /*
    #swagger.tags = ['Users']
    #swagger.path =  '/users/account-recovery'
    #swagger.description = 'Send account recovery will return a token, email contains a code that the user needs to input for the next request'
    #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/accountRecovery" }
            }
        }
    }
    */
    controller.accountRecoveryEmail.bind(controller));
    router.post("/verify-email", 
    /*
   #swagger.tags = ['Users']
   #swagger.path =  '/users/verify-email'
   #swagger.description = 'verify users email'
   */
    controller.verifyEmail.bind(controller));
    // mounts //
    router.use("/secure", secureRouter);
    router.use("/verified", verifiedRouter);
    console.log("Users router initialized.");
    return router;
};
exports.initializeUsersRouter = initializeUsersRouter;
