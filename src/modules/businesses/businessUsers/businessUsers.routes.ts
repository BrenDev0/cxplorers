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
    secureRouter.post("/create", middlewareService.verifyRoles(["owner", "admin"]),
        /*
        #swagger.tags = ['Business Users']
        #swagger.path =  '/business-users/secure/create'
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

  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("BusinessUsers router initialized.");
    return router;
}
