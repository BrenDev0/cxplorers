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
const calendars_routes_1 = require("../../src/modules/calendars/calendars.routes");
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
        const router = (0, calendars_routes_1.initializeCalendarsRouter)();
        app.use("/calendars", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    describe('POST /calendars/secure/create', () => {
        it('should create a new calendar and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/calendars/secure/create')
                .set('Authorization', token)
                .send({
                referenceId: '31ab5f2d1d183690b964a7bc9ba1b8fbd94e280f24823659e972ca6be393bda2@group.calendar.google.com',
                title: 'testing cxplorers',
                description: 'test calendar',
                backgroundColor: '#4986e7',
                foregroundColor: '#000000',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Calendar added.');
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/calendars/secure/create')
                .set('Authorization', token)
                .send({ title: 'Missing referenceId' });
            expect(res.status).toBe(400);
        }));
    });
    describe('GET /secure/calendars/resource/:calendarId', () => {
        // it('should return a calendar by ID for authorized user', async () => {
        //   const res = await request(app)
        //     .get(`/calendars/secure/resource/19db0c18-2121-44d1-bdec-794d21cbf599`)
        //     .set('Authorization', token);
        //   expect(res.status).toBe(200);
        //   expect(res.body.data).toHaveProperty('title');
        // });
        it('should return 404 if calendar does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/calendars/secure/resource/19db0c18-2121-44d1-bdec-794d21cbf59a')
                .set('Authorization', token);
            expect(res.status).toBe(404);
        }));
        // it('should return 403 if user is not authorized to access calendar', async () => {
        //   const res = await request(app)
        //     .get(`/calendars/secure/resource/2`)
        //     .set('Authorization', token);
        //   expect(res.status).toBe(403);
        // });
    });
    describe('GET /calendars/secure/collection', () => {
        it('should return a collection of calendars for the user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/calendars/secure/collection')
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        }));
    });
    describe('DELETE /calendars/secure/:calendarId', () => {
        // it('should delete a calendar and return 200', async () => {
        //   const res = await request(app)
        //     .delete(`/calendars/secure/21c901c0-7d3b-4a6c-823e-353eb0d52b24`)
        //     .set('Authorization', token);
        //   expect(res.status).toBe(200);
        // });
        it('should return 404 if calendar does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/calendars/secure/21c901c0-7d3b-4a6c-823e-353eb0d52b2a')
                .set('Authorization', token);
            expect(res.status).toBe(404);
        }));
        // it('should return 403 if user tries to delete another user\'s calendar', async () => {
        //   const res = await request(app)
        //     .delete(`/calendars/secure/1`)
        //     .set('Authorization', token);
        //   expect(res.status).toBe(403);
        // });
    });
});
