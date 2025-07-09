import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import TagsController from './TagsController';

export const initializeTagsRouter = (customController?: TagsController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<TagsController>("TagsController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.post("/create",
        middlewareService.verifyPermissions("tags", ["write"]),
        /*
        #swagger.tags = ['Tags']
        #swagger.path =  '/tags/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Create tags'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createTag" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource/:tagId",
        middlewareService.verifyPermissions("tags", ["read", "write"]),
        /*
        #swagger.tags = ['Tags']
        #swagger.path =  '/tags/secure/resource/{tagId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get tag by id'
        */
        controller.resourceRequest.bind(controller)
    )

    secureRouter.get("/collection",
        
        /*
        #swagger.tags = ['Tags']
        #swagger.path =  '/tags/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get tags by buisness'
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.put("/:tagId",
        middlewareService.verifyPermissions("tags", ["write"]),
        /*
        #swagger.tags = ['Tags']
        #swagger.path =  '/tags/secure/{tagId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update tags'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateTag" }
                }
            }
        }
        */
        controller.updateRequest.bind(controller)
    )

    secureRouter.delete("/:tagId",
        middlewareService.verifyPermissions("tags", ["write"]),
        /*
        #swagger.tags = ['Tags']
        #swagger.path =  '/tags/secure/{tagId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'delete tag by id'
        */
        controller.deleteRequest.bind(controller)
    )

  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Tags router initialized.");
    return router;
}
