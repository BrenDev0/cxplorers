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

    // protected Routes //
    secureRouter.post("/create", 
        /*
        #swagger.tags = ['Taggings']
        #swagger.path =  '/taggings/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Tag a contact'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createTagging" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/collection", 
        /*
        #swagger.tags = ['Taggings']
        #swagger.path =  '/taggings/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get collection of contacts tagged or a contacts tags'
        #swagger.parameters['filter'] = {
            in: 'query',
            description: 'contact || tag',
            type: 'string',
            required: true
        }
        #swagger.parameters['identifier'] = {
            in: 'query',
            description: 'id of the tag or contact',
            type: 'string',
            required: true
        }
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.delete("/delete",
        /*
        #swagger.tags = ['Taggings']
        #swagger.path =  '/taggings/secure/delete'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Tag a contact'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createTagging" }
                }
            }
        }
        */
        controller.deleteRequest.bind(controller)
    )

  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Taggings router initialized.");
    return router;
}
