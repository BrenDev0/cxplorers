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

     /*
        #swagger.tags = ['Staff']
        #swagger.path =  '/businessUsers/secure'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update businessUsers'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateBusinessUsers" }
                }
            }
        }
        */

    // protected Routes //


  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("BusinessUsers router initialized.");
    return router;
}
