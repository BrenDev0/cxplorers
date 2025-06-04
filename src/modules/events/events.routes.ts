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

     /*
        #swagger.tags = ['Events']
        #swagger.path =  '/events/secure'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update events'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateEvents" }
                }
            }
        }
        */

    // protected Routes //


  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Events router initialized.");
    return router;
}
