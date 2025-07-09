import { Router } from 'express';
import Container from '../../../core/dependencies/Container';
import MiddlewareService from '../../../core/middleware/MiddlewareService';
import BusinessUsersController from './BusinessUsersController';

export const initializeBusinessUsersRouter = (customController?: BusinessUsersController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<BusinessUsersController>("BusinessUsersController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.post("/create", 
        middlewareService.verifyRoles(["admin", "owner"]),
        /*
        #swagger.tags = ['Business Users']
        #swagger.path =  '/business-users/secure/create/'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Create businessUser'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createBusinessUser" }
                }
            }
        }
        */

        controller.createRequest.bind(controller)
    )

    secureRouter.get("/collection",
        middlewareService.verifyRoles(["admin", "owner"]),
        /*
        #swagger.tags = ['Business Users']
        #swagger.path =  '/business-users/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Get all users for a business'
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.get("/read",
        middlewareService.verifyAdminAccount(),
        /*
        #swagger.tags = ['Business Users']
        #swagger.path =  '/business-users/secure/read'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Get all users for all buisness listed in an account'
        */
        controller.readRequest.bind(controller)
    )
  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("BusinessUsers router initialized.");
    return router;
}
