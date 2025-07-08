import { Router } from 'express';
import Container from '../../core/dependencies/Container';
import MiddlewareService from '../../core/middleware/MiddlewareService';
import TasksController from './TasksController';

export const initializeTasksRouter = (customController?: TasksController) => {
    const router = Router();
    const secureRouter = Router();
    const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");
    const controller = customController ?? Container.resolve<TasksController>("TasksController");

    secureRouter.use(middlewareService.auth.bind(middlewareService));

    // protected Routes //
    secureRouter.post("/create",
        middlewareService.verifyRoles(["admin", "owner"]),
        /*
        #swagger.tags = ['Tasks']
        #swagger.path =  '/tasks/secure/create'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'create task'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/createTask" }
                }
            }
        }
        */
        controller.createRequest.bind(controller)
    )

    secureRouter.get("/resource/:taskId", 
        /*
        #swagger.tags = ['Tasks']
        #swagger.path =  '/tasks/secure/resource/{taskId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get task by id'
        */
        controller.resourceRequest.bind(controller)
    )

    secureRouter.get("/collection", 
        /*
        #swagger.tags = ['Tasks']
        #swagger.path =  '/tasks/secure/collection'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'get taks by user or by business'
        #swagger.parameters['col'] = {
            in: 'query',
            description: 'column name for db search user || business',
            type: 'string',
            required: true
        */
        controller.collectionRequest.bind(controller)
    )

    secureRouter.put("/:taskId",
        middlewareService.verifyRoles(["admin", "owner"]),
        /*
        #swagger.tags = ['Tasks']
        #swagger.path =  '/tasks/secure/{taskId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'update task'
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/updateTask" }
                }
            }
        }
        */
        controller.updateRequest.bind(controller)
    )

    secureRouter.delete("/:taskId",
        middlewareService.verifyRoles(["admin", "owner"]),
        /*
        #swagger.tags = ['Tasks']
        #swagger.path =  '/tasks/secure/{taskId}'
        #swagger.security = [{ "bearerAuth": [] }] 
        #swagger.description = 'delete task by id'
        */
        controller.deleteRequest.bind(controller)
    )

    // mounts //

    router.use("/secure", secureRouter);

    console.log("Tasks router initialized.");
    return router;
}
