import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import PermissionsController from './PermissionsController';

export const initializePermissionsRouter = (customController?: PermissionsController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<PermissionsController>("PermissionsController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

     /*
        #swagger.tags = ['Permissions']
        #swagger.path =  '/permissions/secure'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update permissions'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updatePermissions" }
                }
            }
        }
        */

    // protected Routes //


  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Permissions router initialized.");
    return router;
}
