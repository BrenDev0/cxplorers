import { Router } from 'express';
import Container from '../../../core/dependencies/Container';
import MiddlewareService from '../../../core/middleware/MiddlewareService';
import EventAtendeesController from './EventAttendeesController';

export const initializeEventAtendeesRouter = (customController?: EventAtendeesController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<EventAtendeesController>("EventAtendeesController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    

    // protected Routes //

    secureRouter.get("/read", 
        middlewareService.verifyPermissions("calendars", ["read", "write"]),
        /*
        #swagger.tags = ['EventAtendees']
        #swagger.path =  '/eventAtendees/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get all contacts with appointments'
        */
        controller.readRequest.bind(controller)
    )
  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("EventAtendees router initialized.");
    return router;
}
