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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = require("pg");
const createApp_1 = __importDefault(require("../../src/createApp"));
const Container_1 = __importDefault(require("../../src/core/dependencies/Container"));
const configureContainer_1 = require("../../src/core/dependencies/configureContainer");
const supertest_1 = __importDefault(require("supertest"));
const pipelines_routes_1 = require("../../src/modules/pipelines/pipelines.routes");
describe("USERS ROUTES", () => {
    let pool;
    let app;
    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYmQzNzc2NC00Y2QzLTRlNzktODVkMC01MGYxYzBjMzg0MjEiLCJpYXQiOjE3NDg5Njk2MDIsImV4cCI6MTc4MDUwNTYwMn0.JiTqY9FHBaSofTdUnrxmGOLODvNLKvmsqpmOzFA5mSU";
    const verificationToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoxMjM0NTYsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.uBTTn3CM6VVCN0fuN9LOOEodHzxUNGqaScx7HFwSi-Q";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        pool = new pg_1.Pool({
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false,
            }
        });
        app = (0, createApp_1.default)();
        yield (0, configureContainer_1.configureContainer)(pool, process.env.REDIS_URL);
        const middlewareService = Container_1.default.resolve("MiddlewareService");
        const router = (0, pipelines_routes_1.initializePipelinesRouter)();
        app.use("/pipelines", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    describe('POST /pipelines/secure/create', () => {
        // it('should return 200 and create a new pipeline with valid input', async () => {
        //   const res = await request(app)
        //     .post('/pipelines/secure/create')
        //     .set('Authorization', token)
        //     .send({ name: 'no stages' });
        //   expect(res.status).toBe(200);
        //   expect(res.body.message).toBe('pipeline added.');
        // });
        it('should return 200 and create a new pipeline with stages', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/pipelines/secure/create')
                .set('Authorization', token)
                .send({
                name: 'pipeline with stages',
                stages: [{ name: "stage one" }, { name: "stage 2" }]
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('pipeline added.');
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/pipelines/secure/create')
                .set('Authorization', token)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("All fields required");
        }));
    });
    describe('GET /pipelines/secure/resource/:pipelineId', () => {
        it('should return 200 and the pipeline data for a valid ID and authorized user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/pipelines/secure/resource/78f5ed70-56af-461f-a891-6a712242fee3')
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('name');
        }));
        it('should return 403 if user is not authorized to access the pipeline', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/pipelines/secure/resource/c0b4aff1-48f3-49e7-8f94-e2872fca22f7')
                .set('Authorization', token);
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("User not authorized to perform this action");
        }));
        it('should return 404 if pipeline is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/pipelines/secure/resource/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', token);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Pipeline not found');
        }));
    });
    describe('PUT/pipelines/secure/:pipelineId', () => {
        // it('should return 200 and update the pipeline with allowed fields', async () => {
        //   const res = await request(app)
        //     .put('/pipelines/secure/4baeafae-1b45-450c-9d3e-5995c479f748')
        //     .set('Authorization', token)
        //     .send({ name: 'Updated Pipeline' });
        //   expect(res.status).toBe(200);
        //   expect(res.body.message).toBe('pipeline updated');
        // });
        it('should return 404 if pipeline does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put('/pipelines/secure/123e4567-e89b-12d3-a456-426614174000')
                .set('Authorization', token)
                .send({ name: 'Will not update' });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Pipeline not found');
        }));
    });
    describe('DELETE /pipelines/secure/:pipelineId', () => {
        //   it('should return 200 and delete the pipeline for authorized user', async () => {
        //     const res = await request(app)
        //       .delete('/pipelines/secure/49ee5d52-f263-470f-a7a7-aea4a420d1e9')
        //       .set('Authorization', token);
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe('Pipeline deleted');
        //   });
        it('should return 403 if user is not authorized to delete the pipeline', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/pipelines/secure/c0b4aff1-48f3-49e7-8f94-e2872fca22f7')
                .set('Authorization', token);
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("User not authorized to perform this action");
        }));
    });
});
