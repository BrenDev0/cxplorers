import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import GoogleController from './GoogleController';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import GoogleCalendarController from './calendar/GoogleCalendarController';

export const initializeGoogleRouter = (customController?: GoogleController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<GoogleController>("GoogleController");
    
    secureRouter.use(middlewareService.auth.bind(middlewareService));
    
    // general //

    secureRouter.get("/url", 
        middlewareService.verifyPermissions("calendars", ["read", "write"]),
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/url' 
        #swagger.description = 'get google auth href'
        */
        controller.getUrl.bind(controller)
    );
    
    

 
    // secureRouter.get("/calendars/events/:calendarId", 
    //     /*
    //     #swagger.tags = ['Google'] 
    //      #swagger.security = [{ "bearerAuth": [] }]
    //     #swagger.path = '/google/secure/calendars/events/{calendarId}' 
    //     #swagger.description = 'get users calendars events'
    //     */
    //     calendarController.getCalendarEvents.bind(calendarController)
    // )

    router.get("/callback", 

        controller.callback.bind(controller)
    )

    
    // mounts // 
    router.use("/secure", secureRouter);
    
    console.log("Google router initialized.");
    return router;
}

