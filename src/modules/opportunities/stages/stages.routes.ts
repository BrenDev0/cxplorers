import { Router } from 'express';
import Container from '../../../core/dependencies/Container';
import MiddlewareService from '../../../core/middleware/MiddlewareService';
import StagesController from './StagesController';

export const initializeStagesRouter = (customController?: StagesController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<StagesController>("StagesController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.get("/collection/:pipelineId", 
        /*
        #swagger.tags = ['Stages']
        #swagger.path =  '/stages/secure/collection/{pipelineId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get stages by pipelineId'
        */

        controller.collectionRequest.bind(controller)
    )

    secureRouter.delete("/:stageId", 
        /*
        #swagger.tags = ['Stages']
        #swagger.path =  '/stages/secure/{stageId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'delete stage by id'
        */
        controller.deleteRequest.bind(controller)
    )

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Stages router initialized.");
    return router;
}
