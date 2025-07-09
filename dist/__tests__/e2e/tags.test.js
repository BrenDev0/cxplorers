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
const tags_routes_1 = require("../../src/modules/tags/tags.routes");
describe("TAGS ROUTES", () => {
    let pool;
    let app;
    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWUzNjRkMS02MTU1LTRiNzUtYjAwMy1iM2E1YmFjMjhlYzYiLCJidXNpbmVzc0lkIjoiM2EwNDVhMTEtYWY5Ni00ZTM1LTk5MTUtYzcyOGEzYjBlYjJhIiwiaWF0IjoxNzUxOTkxMTYwLCJleHAiOjE3ODM1MjcxNjB9.HCy_dqPjFQwpti6RfRjeEEO-eAV69R7XqysrbEG4sbs";
    const verificationToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoxMjM0NTYsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.uBTTn3CM6VVCN0fuN9LOOEodHzxUNGqaScx7HFwSi-Q";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        pool = new pg_1.Pool({
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false,
            }
        });
        app = (0, createApp_1.default)();
        yield (0, configureContainer_1.configureContainer)(pool);
        const middlewareService = Container_1.default.resolve("MiddlewareService");
        const router = (0, tags_routes_1.initializeTagsRouter)();
        app.use("/tags", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    describe('POST /tags/secure/create', () => {
        it('should return 200 and confirmation message when tag is successfully created', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/tags/secure/create')
                .set('Authorization', token)
                .send({ tag: 'important' });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Tag added');
        }));
        it('should return 400 if tag is missing in request body', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/tags/secure/create')
                .set('Authorization', token)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/tag.*required/i);
        }));
    });
    describe('GET /tags/secure/resource/:tagId', () => {
        it('should return 200 and the tag data for a valid tagId', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/tags/secure/resource/`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('tag');
        }));
        it('should return 400 for invalid tagId format', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/tags/secure/resource/invalid-uuid')
                .set('Authorization', token);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch("Invalid ID format");
        }));
    });
    describe('GET /secure/tags', () => {
        it('should return 200 and list of tags', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/tags/secure/collection')
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        }));
    });
    describe('PUT /tags/secure/:tagId', () => {
        it('should return 200 when tag is successfully updated', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put(`/tags/secure/`)
                .set('Authorization', token)
                .send({ tag: 'updated-tag' });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Tag updated');
        }));
        it('should return 400 for invalid tagId format', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put('/tags/secure/not-a-uuid')
                .set('Authorization', token)
                .send({ tag: 'new' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch("Invalid ID format");
        }));
    });
    describe('DELETE /secure/tags/:tagId', () => {
        it('should return 200 and confirmation message when tag is successfully deleted', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete(`/tags/secure/`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Tag deleted');
        }));
        it('should return 400 for invalid tagId format', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/tags/secure/invalid-uuid')
                .set('Authorization', token);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch("Invalid ID format");
        }));
    });
});
