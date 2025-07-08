"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createApp_1 = __importDefault(require("./createApp"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./core/swagger/swagger.json"));
const configureContainer_1 = require("./core/dependencies/configureContainer");
const Container_1 = __importDefault(require("./core/dependencies/Container"));
const google_routes_1 = require("./modules/google/google.routes");
const users_routes_1 = require("./modules/users/users.routes");
const tokens_routes_1 = require("./modules/tokens/tokens.routes");
const calendars_routes_1 = require("./modules/calendars/calendars.routes");
const pipelines_routes_1 = require("./modules/opportunities/pipelines/pipelines.routes");
const stages_routes_1 = require("./modules/opportunities/stages/stages.routes");
const opportunities_routes_1 = require("./modules/opportunities/opportunities.routes");
const businesses_routes_1 = require("./modules/businesses/businesses.routes");
const businessUsers_routes_1 = require("./modules/businesses/businessUsers/businessUsers.routes");
const tasks_routes_1 = require("./modules/tasks/tasks.routes");
const server = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, createApp_1.default)();
    yield (0, configureContainer_1.configureContainer)();
    const middlewareService = Container_1.default.resolve("MiddlewareService");
    // routers //
    const businessesRouter = (0, businesses_routes_1.initializeBusinessesRouter)();
    const businessUsersRouter = (0, businessUsers_routes_1.initializeBusinessUsersRouter)();
    const calendarsRouter = (0, calendars_routes_1.initializeCalendarsRouter)();
    const googleRouter = (0, google_routes_1.initializeGoogleRouter)();
    const opportunitiesRouter = (0, opportunities_routes_1.initializeOpportunitiesRouter)();
    const piplinesRouter = (0, pipelines_routes_1.initializePipelinesRouter)();
    const stagesRouter = (0, stages_routes_1.initializeStagesRouter)();
    const tasksRouter = (0, tasks_routes_1.initializeTasksRouter)();
    const tokensRouter = (0, tokens_routes_1.initializeTokensRouter)();
    const usersRouter = (0, users_routes_1.initializeUsersRouter)();
    // Routes //
    process.env.NODE_ENV === "production" && app.use(middlewareService.verifyHMAC);
    process.env.NODE_ENV !== 'production' && app.use('/docs/endpoints', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
    app.use("/businesses", businessesRouter);
    app.use("/business-users", businessUsersRouter);
    app.use("/calendars", calendarsRouter);
    app.use("/google", googleRouter);
    app.use("/opportunities", opportunitiesRouter);
    app.use("/pipelines", piplinesRouter);
    app.use("/stages", stagesRouter);
    app.use("/tasks", tasksRouter);
    app.use("/tokens", tokensRouter);
    app.use("/users", usersRouter);
    app.use((req, res) => {
        res.status(404).json({ message: "Route not found." });
    });
    app.use(middlewareService.handleErrors.bind(middlewareService));
    const PORT = process.env.SERVER_PORT || 3000;
    app.listen(PORT, () => {
        console.log("online");
    });
});
server();
