import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import TokensController from './TokensController';

export const initializeTokensRouter = (customController?: TokensController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<TokensController>("TokensController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //

    secureRouter.post("/create", 
         /*
        #swagger.tags = ['Tokens']
        #swagger.path =  '/tokens/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'create token'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createToken" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource/:tokenId", 
         /*
        #swagger.tags = ['Tokens']
        #swagger.path =  '/tokens/secure/resource/{tokenId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get token by id'
        */
        controller.resourceRequest.bind(controller)
    )

    secureRouter.put("/:tokenId",
         /*
        #swagger.tags = ['Tokens']
        #swagger.path =  '/tokens/secure/{tokenId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'Update token'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateToken" }
                }
            }
        }
        */
        controller.updateRequest.bind(controller)
    )
  
    secureRouter.delete("/:tokenId", 
         /*
        #swagger.tags = ['Tokens']
        #swagger.path =  '/tokens/secure/{tokenId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'delete token by id'
        */
        controller.deleteRequest.bind(controller)
    )
    // mounts //

    router.use("/secure", secureRouter);

    console.log("Tokens router initialized.");
    return router;
}
