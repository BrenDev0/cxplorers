import { Router } from 'express';
import Container from '../../../core/dependencies/Container';
import MiddlewareService from '../../../core/middleware/MiddlewareService';
import PipelinesController from './PipelinesController';

export const initializePipelinesRouter = (customController?: PipelinesController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<PipelinesController>("PipelinesController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.post("/create",
          /*
        #swagger.tags = ['Pipelines']
        #swagger.path =  '/pipelines/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'create pipeline, stages field is optional'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createPipeline" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource/:pipelineId",
         /*
        #swagger.tags = ['Pipelines']
        #swagger.path =  '/pipelines/secure/resource/{pipelineId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get pipeline by id'
        */
        controller.resourceRequest.bind(controller)
    )

    secureRouter.get("/collection", 
        /*
        #swagger.tags = ['Pipelines']
        #swagger.path =  '/pipelines/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get pipelines by business id in token'
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.put("/:pipelineId",
         /*
        #swagger.tags = ['Pipelines']
        #swagger.path =  '/pipelines/secure/{piplineId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update pipelines stages optional in request'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updatePipeline" }
                }
            }
        }
        */
        controller.updateRequest.bind(controller)
    )

    secureRouter.delete("/:pipelineId",
        /*
        #swagger.tags = ['Pipelines']
        #swagger.path =  '/pipelines/secure/{pipelineId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'delete pipeline by id'
        */
        controller.deleteRequest.bind(controller)
    )

  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Pipelines router initialized.");
    return router;
}
