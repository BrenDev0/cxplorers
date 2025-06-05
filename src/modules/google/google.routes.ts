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

    secureRouter.get("/calendars/sync/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/sync/{calendarId}' 
        #swagger.description = 'sync users calendar'
        */
        calendarController.syncCalendar.bind(controller)
    )

     secureRouter.get("/calendars", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars' 
        #swagger.description = 'get users calendars from drive'
        */
        calendarController.getCalendars.bind(controller)
    )

    secureRouter.get("/calendars/events/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/events/{calendarId}' 
        #swagger.description = 'get users calendars events'
        */
        calendarController.getCalendarEvents.bind(controller)
    )

    secureRouter.delete("/calendars/sync/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/sync/{calendarId}' 
        #swagger.description = 'unSync users calendar'
        */
        calendarController.unSyncCalendar.bind(controller)
    )

    // for google use //
    router.get("/callback", 
        // #swagger.ignore = true    
        controller.callback.bind(controller)
    );

    router.post("/calendars/notifications", 

        calendarController.handleCalendarNotifications.bind(controller)
    )

    // mounts // 
    router.use("/secure", secureRouter);
    

    console.log("Google router initialized.");
    return router;
}

