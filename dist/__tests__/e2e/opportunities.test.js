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
const opportunities_routes_1 = require("../../src/modules/opportunities/opportunities.routes");
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
        const router = (0, opportunities_routes_1.initializeOpportunitiesRouter)();
        app.use("/opportunities", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    describe('POST /opportunities/secure/create', () => {
        it('should create a new opportunity and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const body = { contactId: "fab8ed99-84b0-48a0-aeb1-424c6f7756a2", stageId: "4fc4645f-42eb-4af8-896a-0a70a7eafdcb" };
            const res = yield (0, supertest_1.default)(app)
                .post('/opportunities/secure/create')
                .set('Authorization', token)
                .send(body);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Opportunity added.');
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/opportunities/secure/create')
                .set('Authorization', token)
                .send({});
            expect(res.status).toBe(400);
        }));
    });
    describe('GET /opportunities/secure/resource/:opportunityId', () => {
        it('should return 200 and opportunity resource if authorized', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/opportunities/secure/resource/612ce138-5e63-407b-99dc-7a45c0ad0610`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('stageId');
        }));
        it('should return 400 for invalid opportunityId format', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/opportunities/secure/resource/invalid-id')
                .set('Authorization', token);
            expect(res.status).toBe(400);
        }));
    });
    describe('GET /opportunities/secure/collection/:stageId', () => {
        it('should return 200 and a list of opportunities', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/opportunities/secure/collection/4fc4645f-42eb-4af8-896a-0a70a7eafdcb`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        }));
        // it('should return 400 for invalid stageId format', async () => {
        //   const res = await request(app)
        //     .get('/opportunities/secure/collection/123e4567-e89b-12d3-a456-426614174000B')
        //     .set('Authorization', token);
        //   expect(res.status).toBe(400);
        // });
    });
    describe('PUT /secure/opportunities/:opportunityId', () => {
        it('should update opportunity and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const body = { opportunityValue: 5000, notes: "Updated opportunity" };
            const res = yield (0, supertest_1.default)(app)
                .put(`/opportunities/secure/612ce138-5e63-407b-99dc-7a45c0ad0610`)
                .set('Authorization', token)
                .send(body);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Opportunity updated');
        }));
        it('should return 400 for invalid opportunityId format', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put('/opportunities/secure/invalid-id')
                .set('Authorization', token)
                .send({ opportunityValue: 5000 });
            expect(res.status).toBe(400);
        }));
    });
    describe('DELETE /secure/opportunities/:opportunityId', () => {
        it('should delete opportunity and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete(`/opportunities/secure/25b61adc-1f22-4846-8c13-16356f5ba642`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Opportunity deleted');
        }));
        it('should return 400 for invalid opportunityId format', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/opportunities/secure/invalid-id')
                .set('Authorization', token);
            expect(res.status).toBe(400);
        }));
    });
});
