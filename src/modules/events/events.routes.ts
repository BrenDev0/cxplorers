import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import EventsController from './EventsController';

export const initializeEventsRouter = (customController?: EventsController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<EventsController>("EventsController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    //  secureRouter.get("/collection", 
    //     /*
    //     #swagger.tags = ['Events']
    //     #swagger.path =  '/events/secure/collection'
    //     #swagger.security = [{ "bearerAuth": [] }] 
    //     #swagger.description = 'get events for calender'
    //     #swagger.requestBody = {
    //         required: true,
    //         content: {
    //             "application/json": {
    //                 schema: { $ref: "#/components/schemas/updateEvents" }
    //             }
    //         }
    //     }
    //     */
    //     controller.collectionRequest.bind(controller)
    // )

    // protected Routes //


  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Events router initialized.");
    return router;
}
