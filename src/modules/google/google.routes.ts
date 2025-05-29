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
    
   // protected //
    secureRouter.get("/url", 
        /*
        #swagger.tags = ['Google'] 
         #swagger.security = [{ "bearerAuth": [] }]
        #swagger.path = '/google/secure/url' 
        #swagger.description = 'get google auth href'
        */
        controller.getUrl.bind(controller)
    );
   
    // unprotected //

    router.get("/callback", 
        // #swagger.ignore = true    
        controller.callback.bind(controller)
    );

    // mounts // 
    router.use("/secure", secureRouter);
    

    console.log("Google router initialized.");
    return router;
}

