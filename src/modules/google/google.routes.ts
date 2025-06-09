import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import GoogleController from './GoogleController';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import GoogleCalendarController from './calendar/GoogleCalendarController';

export const initializeGoogleRouter = (customController?: GoogleController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const calendarController = Container.resolve<GoogleCalendarController>("GoogleCalendarController");
    const controller = customController ?? Container.resolve<GoogleController>("GoogleController");
    
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    
    // general //

    secureRouter.get("/url", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/url' 
        #swagger.description = 'get google auth href'
        */
        controller.getUrl.bind(controller)
    );
    

    // calendar //

    secureRouter.get("/calendars", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars' 
        #swagger.description = 'get users calendars from drive'
        */
        calendarController.getCalendars.bind(controller)
    )

    // sync //

    secureRouter.get("/calendars/sync/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/sync/{calendarId}' 
        #swagger.description = 'sync users calendar'
        */
        calendarController.syncCalendar.bind(calendarController)
    )

    secureRouter.delete("/calendars/sync/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/sync/{calendarId}' 
        #swagger.description = 'unSync users calendar'
        */
        calendarController.unSyncCalendar.bind(calendarController)
    )

    

    // events //
    
    secureRouter.post("/calendars/events/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/calendars/secure/events/:calendarId' 
        #swagger.description = 'create event for full list of parameters check: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert for parameters'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createEvent" }
                }
            }
        }
        */
        calendarController.createEventRequest.bind(calendarController)
    )

    secureRouter.delete("/calendars/events/:eventId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/events/{eventId}' 
        #swagger.description = 'delete an event'
        */
        calendarController.deleteEventRequest.bind(calendarController)
    )

    // secureRouter.get("/calendars/events/:calendarId", 
    //     /*
    //     #swagger.tags = ['Google'] 
    //      #swagger.security = [{ "bearerAuth": [] }]
    //     #swagger.path = '/google/secure/calendars/events/{calendarId}' 
    //     #swagger.description = 'get users calendars events'
    //     */
    //     calendarController.getCalendarEvents.bind(calendarController)
    // )

    

    // for google use //

    router.get("/callback", 
        // #swagger.ignore = true    
        controller.callback.bind(controller)
    );

    router.post("/calendars/notifications", 

        calendarController.handleCalendarNotifications.bind(calendarController)
    )

    // mounts // 
    router.use("/secure", secureRouter);
    
    console.log("Google router initialized.");
    return router;
}

