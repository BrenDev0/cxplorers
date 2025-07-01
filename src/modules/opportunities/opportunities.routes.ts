import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import OpportunitiesController from './OpportunitiesController';

export const initializeOpportunitiesRouter = (customController?: OpportunitiesController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<OpportunitiesController>("OpportunitiesController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.post("/create",
        /*
        #swagger.tags = ['Opportunities']
        #swagger.path =  '/opportunities/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Create opportunity'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createOpportunity" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource/:opportunityId",
        /*
        #swagger.tags = ['Opportunities']
        #swagger.path =  '/opportunities/secure/resource/{opportunityId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get opportunity by id'
        */
        controller.resourceRequest.bind(controller)
    )

    secureRouter.get("/collection/:stageId",
        /*
        #swagger.tags = ['Opportunities']
        #swagger.path =  '/opportunities/secure/collection/{stageId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get opportunities by stage id'
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.put("/:opportunityId", 
        /*
        #swagger.tags = ['Opportunities']
        #swagger.path =  '/opportunities/secure/{opportunityId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'update opportunity by id'
        */
        controller.updateRequest.bind(controller)
    )

    secureRouter.delete("/:opportunityId",
        /*
        #swagger.tags = ['Opportunities']
        #swagger.path =  '/opportunities/secure/{opportunityId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'delete opportunity by id'
        */
        controller.deleteRequest.bind(controller)
    )
  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Opportunities router initialized.");
    return router;
}
