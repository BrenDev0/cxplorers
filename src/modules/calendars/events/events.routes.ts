import { Router } from 'express';
import Container from '../../../core/dependencies/Container';
import MiddlewareService from '../../../core/middleware/MiddlewareService';
import EventsController from './EventsController';

export const initializeEventsRouter = (customController?: EventsController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<EventsController>("EventsController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //

    secureRouter.get("/collection/:calendarId", 
        middlewareService.verifyPermissions("calendars", ["read", "write"]),
        /*
        #swagger.tags = ['Events']
        #swagger.path =  '/events/secure/collection/{calendarId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get events for calender'
        */
        controller.collectionRequest.bind(controller)
    )
  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Events router initialized.");
    return router;
}
