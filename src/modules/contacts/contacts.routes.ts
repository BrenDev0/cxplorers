import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import ContactsController from './ContactsController';

export const initializeContactsRouter = (customController?: ContactsController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<ContactsController>("ContactsController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

     // protected Routes //
    secureRouter.post("/create", 
        /*
        #swagger.tags = ['Contacts']
        #swagger.path =  '/contacts/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'create contact'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createContact" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource/:contactId",
        /*
        #swagger.tags = ['Contacts']
        #swagger.path =  '/contacts/secure/resource/{contactId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get contact by id'
        */
        controller.resourceRequest.bind(controller)
    )
     
    secureRouter.get("/collection",
        /*
        #swagger.tags = ['Contacts']
        #swagger.path =  '/contacts/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get users contacts'
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.put("/:contactId", 
        /*
        #swagger.tags = ['Contacts']
        #swagger.path =  '/contacts/secure/{contactId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'update contact'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateContact" }
                }
            }
        }
        */
        controller.updateRequest.bind(controller)
    )


    secureRouter.delete("/:contactId", 
        /*
            #swagger.tags = ['Contacts']
            #swagger.path =  '/contacts/secure/{contactId}'
            #swagger.security = [{ "bearerAuth": [] }] 
            #swagger.description = 'deletecontact'
            */
        controller.deleteRequest.bind(controller)
    )

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Contacts router initialized.");
    return router;
}
