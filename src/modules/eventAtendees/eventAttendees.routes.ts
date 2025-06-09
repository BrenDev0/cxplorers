import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import EventAtendeesController from './EventAttendeesController';

export const initializeEventAtendeesRouter = (customController?: EventAtendeesController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<EventAtendeesController>("EventAtendeesController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

     /*
        #swagger.tags = ['EventAtendees']
        #swagger.path =  '/eventAtendees/secure'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update eventAtendees'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateEventAtendees" }
                }
            }
        }
        */

    // protected Routes //


  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("EventAtendees router initialized.");
    return router;
}
