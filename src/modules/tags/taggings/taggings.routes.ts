import { Router } from 'express';
import Container from '../../../core/dependencies/Container';
import MiddlewareService from '../../../core/middleware/MiddlewareService';
import TaggingsController from './TaggingsController';

export const initializeTaggingsRouter = (customController?: TaggingsController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<TaggingsController>("TaggingsController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

     /*
        #swagger.tags = ['Taggings']
        #swagger.path =  '/taggings/secure'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update taggings'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateTaggings" }
                }
            }
        }
        */

    // protected Routes //


  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Taggings router initialized.");
    return router;
}
