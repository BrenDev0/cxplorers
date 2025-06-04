import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import GoogleController from './GoogleController';
import MiddlewareService from '../../core/middleware/MiddlewareService';

export const initializeGoogleRouter = (customController?: GoogleController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
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


    router.get("/callback", 
        // #swagger.ignore = true    
        controller.callback.bind(controller)
    );

    

    // calendar //
    secureRouter.get("/calendars/sync/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/sync/{calendarId}' 
        #swagger.description = 'sync users calendar'
        */
        controller.syncCalendar.bind(controller)
    )

    secureRouter.delete("/calendars/sync/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/sync/{calendarId}' 
        #swagger.description = 'unSync users calendar'
        */
        controller.syncCalendar.bind(controller)
    )

    secureRouter.get("/calendars", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars' 
        #swagger.description = 'get users calendars from drive'
        */
        controller.getCalendars.bind(controller)
    )

    secureRouter.get("/calendars/events/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/events/{calendarId}' 
        #swagger.description = 'get users calendars from drive'
        */
        controller.getCalendarEvents.bind(controller)
    )

    secureRouter.get("/calendars/events/:calendarId", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/calendars/events/{calendarId}' 
        #swagger.description = 'get users calendars from drive'
        */
        controller.getCalendarEvents.bind(controller)
    )

    // for google use //
    router.post("/calendars/notifications", 

        controller.handleCalendarNotifications.bind(controller)
    )

    // mounts // 
    router.use("/secure", secureRouter);
    

    console.log("Google router initialized.");
    return router;
}

