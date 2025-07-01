import { Request, Response } from 'express';
import createApp from './createApp';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './core/swagger/swagger.json';
import { configureContainer } from './core/dependencies/configureContainer';
import Container from './core/dependencies/Container';
import MiddlewareService from './core/middleware/MiddlewareService';
import { initializeGoogleRouter } from './modules/google/google.routes';
import { initializeUsersRouter } from './modules/users/users.routes';
import { initializeTokensRouter } from './modules/tokens/tokens.routes';
import { initializeCalendarsRouter } from './modules/calendars/calendars.routes';
import { initializePipelinesRouter } from './modules/pipelines/pipelines.routes';
import { initializeStagesRouter } from './modules/stages/stages.routes';
import { initializeOpportunitiesRouter } from './modules/opportunities/opportunities.routes';


const server = async() => {
    const app = createApp();
    await configureContainer();

    const middlewareService: MiddlewareService =  Container.resolve("MiddlewareService");

    // routers //
    const calendarsRouter = initializeCalendarsRouter();
    const googleRouter = initializeGoogleRouter();
    const opportunitiesRouter = initializeOpportunitiesRouter();
    const piplinesRouter = initializePipelinesRouter();
    const stagesRouter = initializeStagesRouter();
    const tokensRouter = initializeTokensRouter();
    const usersRouter = initializeUsersRouter();

   
    
    // Routes //
    process.env.NODE_ENV === "production" && app.use(middlewareService.verifyHMAC);
    process.env.NODE_ENV !== 'production' && app.use('/docs/endpoints', swaggerUi.serve, swaggerUi.setup(swaggerFile));

    app.use("/calendars",   calendarsRouter);
    app.use("/google", googleRouter);
    app.use("/opportunities", opportunitiesRouter);
    app.use("/pipelines", piplinesRouter);
    app.use("/stages", stagesRouter);
    app.use("/tokens", tokensRouter);
    app.use("/users", usersRouter);


    app.use((req: Request, res: Response) => {
        res.status(404).json({ message: "Route not found." });
    });

    app.use(middlewareService.handleErrors.bind(middlewareService))


    const PORT = process.env.SERVER_PORT || 3000
    app.listen(PORT, () => {
        console.log("online");
    });
}

server();

