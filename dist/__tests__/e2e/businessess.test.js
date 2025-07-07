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
const businesses_routes_1 = require("../../src/modules/businesses/businesses.routes");
describe("USERS ROUTES", () => {
    let pool;
    let app;
    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWUzNjRkMS02MTU1LTRiNzUtYjAwMy1iM2E1YmFjMjhlYzYiLCJpYXQiOjE3NTE5MTAyMDQsImV4cCI6MTc4MzQ0NjIwNH0.pYJu3dA6Lc1EN5LBdMt0gcPJX_cAqJ0_AMLsoy0BZjo";
    const verificationToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoxMjM0NTYsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.uBTTn3CM6VVCN0fuN9LOOEodHzxUNGqaScx7HFwSi-Q";
    const nonAdminToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYmQzNzc2NC00Y2QzLTRlNzktODVkMC01MGYxYzBjMzg0MjEiLCJpYXQiOjE3NDg5Njk2MDIsImV4cCI6MTc4MDUwNTYwMn0.JiTqY9FHBaSofTdUnrxmGOLODvNLKvmsqpmOzFA5mSU";
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
        const router = (0, businesses_routes_1.initializeBusinessesRouter)();
        app.use("/businesses", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    describe('POST /businesses/secure/create', () => {
        // it('should create a new business and return a token', async () => {
        //     const res = await request(app)
        //     .post('/businesses/secure/create')
        //     .set('Authorization', token)
        //     .send({
        //         legalName: 'Test Business LLC',
        //         businessEmail: 'test@business.com',
        //     });
        //     console.log(res.body)
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe('Business added.');
        //     expect(res.body.token).toBeDefined();
        // });
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/businesses/secure/create')
                .set('Authorization', token)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('All fields required');
        }));
    });
    describe('GET /secure/businesses/:businessId', () => {
        it('should return 200 and business data for valid ID and permissions', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/secure/businesses/resource`)
                .set('Authorization', "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWUzNjRkMS02MTU1LTRiNzUtYjAwMy1iM2E1YmFjMjhlYzYiLCJidXNpbmVzc0lkIjoiZTVlYmRjNjAtNDRiOS00YjFiLThlMzYtMDYwZTY2YTFkMWM1IiwiaWF0IjoxNzUxOTEzNDEzLCJleHAiOjE3NTE5MTQzMTN9.htqDRHS3NQ2XwFbSdqqRdst0rbqqnlpw7AX_kV7QyYM");
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('business_id');
        }));
        it('should return 400 for invalid UUID', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/secure/businesses/resource/abc')
                .set('Authorization', token);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid UUID format');
        }));
    });
});
