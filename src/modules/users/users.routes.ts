import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import UsersController from './UsersController';

export const initializeUsersRouter = (customController?: UsersController) => {
    const router = Router();
    const secureRouter = Router();
    const verifiedRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<UsersController>("UsersController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));
    verifiedRouter.use(middlewareService.verification.bind(middlewareService))

     
    // protected Routes //

    secureRouter.get("/resource", 
         /*
        #swagger.tags = ['Users']
        #swagger.path =  '/users/secure/resource'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Get current user'
        */
        controller.resourceRequest.bind(controller)
    );

    secureRouter.put("/account", 
        /*
        #swagger.tags = ['Users']
        #swagger.path =  '/users/secure/account'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'update user account details'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateUser" }
                }
            }
        }
        */
        controller.updateRequest.bind(controller)
    );

    secureRouter.delete("/delete", 
        /*
        #swagger.tags = ['Users']
        #swagger.path =  '/users/secure/delete'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Delete current user'
        */
        controller.deleteRequest.bind(controller)
    )

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
        controller.createRequest.bind(controller)
    );

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
        controller.verifiedUpdateRequest.bind(controller)
    )

    // unprotected //

    router.post("/login", 
        /*
        #swagger.tags = ['Users']
        #swagger.path =  '/users/login'
        #swagger.description = 'user login'
        */
        controller.login.bind(controller)
    )

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
        controller.accountRecoveryEmail.bind(controller)
    )

    router.use("/verify-email", 
         /*
        #swagger.tags = ['Users']
        #swagger.path =  '/users/verify-email'
        #swagger.description = 'verify users email'
        */
        controller.verifyEmail.bind(controller)
    );

    // mounts //

    router.use("/secure", secureRouter);
    router.use("/verified", verifiedRouter)

    console.log("Users router initialized.");
    return router;
}
