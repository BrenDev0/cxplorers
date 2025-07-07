import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import BusinessesController from './BusinessesController';

export const initializeBusinessesRouter = (customController?: BusinessesController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<BusinessesController>("BusinessesController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.post("/create", 
        middlewareService.verifyAdminAccount(),
        /*
        #swagger.tags = ['Businesses']
        #swagger.path =  '/businesses/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Create business, will recieve a new token'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createBusiness" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource", 
        middlewareService.verifyRoles(["owner", "admin"]),
         /*
        #swagger.tags = ['Businesses']
        #swagger.path =  '/businesses/secure/resource/{businessId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Get business by id'
        */
        controller.resourceRequest.bind(controller)
    )

    secureRouter.get("/collection", 
        middlewareService.verifyAdminAccount(),
         /*
        #swagger.tags = ['Businesses']
        #swagger.path =  '/businesses/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Get businesses by user'
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.put("/",
         middlewareService.verifyRoles(["owner"]),
        /*
        #swagger.tags = ['Businesses']
        #swagger.path =  '/businesses/secure/{businessId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update business'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateBusiness" }
                }
            }
        }
        */
        controller.updateRequest.bind(controller)
    )

    secureRouter.delete("/:businessId", 
        middlewareService.verifyRoles(["owner"]),
        /*
        #swagger.tags = ['Businesses']
        #swagger.path =  '/businesses/secure/{businessId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Delete business'
        */
        controller.deleteRequest.bind(controller)
    )

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Businesses router initialized.");
    return router;
}
