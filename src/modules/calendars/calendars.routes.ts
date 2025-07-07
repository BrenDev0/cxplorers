import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import CalendarsController from './CalendarsController';

export const initializeCalendarsRouter = (customController?: CalendarsController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<CalendarsController>("CalendarsController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.post("/create",
        middlewareService.verifyPermissions("calendars", ["write"]),
         /*
        #swagger.tags = ['Calendars']
        #swagger.path =  '/calendars/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Create calendar'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createCalendar" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource/:calendarId", 
        middlewareService.verifyPermissions("calendars", ["read", "write"]),
         /*
        #swagger.tags = ['Calendars']
        #swagger.path =  '/calendars/secure/resource/{calendarId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get calendar by id'
        */
        controller.resourceRequest.bind(controller)
    )

    secureRouter.get("/collection", 
        middlewareService.verifyPermissions("calendars", ["read", "write"]),
         /*
        #swagger.tags = ['Calendars']
        #swagger.path =  '/calendars/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get users calendars'
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.delete("/:calendarId", 
        middlewareService.verifyPermissions("calendars", ["read", "write"]),
         /*
        #swagger.tags = ['Calendars']
        #swagger.path =  '/calendars/secure/{calendarId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Delete calendars'
        */
        controller.deleteRequest.bind(controller)
    )

  

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Calendars router initialized.");
    return router;
}
