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
    
    // protected Routes //
    secureRouter.post("/create", middlewareService.verifyRoles(["OWNER", "ADMIN"]),
        /*
        #swagger.tags = ['Permissions']
        #swagger.path =  '/permissions/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'create permissions'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createPermission" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Permissions router initialized.");
    return router;
}
