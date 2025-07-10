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
const taggings_routes_1 = require("../../src/modules/tags/taggings/taggings.routes");
describe("TAGGINGS ROUTES", () => {
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
        const router = (0, taggings_routes_1.initializeTaggingsRouter)();
        app.use("/taggings", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    describe('POST /taggings/secure/create', () => {
        // it('should return 200 when a tagging is created successfully', async () => {
        //     const res = await request(app)
        //     .post('/taggings/secure/create')
        //     .set('Authorization', token)
        //     .send({ tagId: "51d1af07-ee43-42b1-9df5-923c3d677302", contactId: "4592b786-0652-4e10-b4f7-dfdf805d1f2e" });
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe('Tagging added');
        // });
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/taggings/secure/create')
                .set('Authorization', token)
                .send({ contactId: "4592b786-0652-4e10-b4f7-dfdf805d1f2e" });
            expect(res.status).toBe(400);
            expect(res.body.message).toBeDefined();
        }));
    });
    // describe('GET /secure/taggings', () => {
    //     it('should return 200 and tagging list filtered by contact', async () => {
    //         const res = await request(app)
    //         .get(`/taggings/secure/collection?filter=contact&identifier=4592b786-0652-4e10-b4f7-dfdf805d1f2e`)
    //         .set('Authorization', token);
    //         console.log(res.body)
    //         expect(res.status).toBe(200);
    //         expect(Array.isArray(res.body.data)).toBe(true);
    //     });
    //     it('should return 200 and tagging list filtered by tag', async () => {
    //         const res = await request(app)
    //         .get(`/taggings/secure/collection?filter=tag&identifier=51d1af07-ee43-42b1-9df5-923c3d677302`)
    //         .set('Authorization', token);
    //         console.log(res.body)
    //         expect(res.status).toBe(200);
    //         expect(Array.isArray(res.body.data)).toBe(true);
    //     });
    //     it('should return 400 if query is missing', async () => {
    //         const res = await request(app)
    //         .get(`/taggings/secure/collection?identifier=51d1af07-ee43-42b1-9df5-923c3d677302`)
    //         .set('Authorization', token);
    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe('Invalid query');
    //     });
    // });
    describe('DELETE /taggings/secure/delete', () => {
        it('should return 200 when tagging is deleted successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/taggings/secure/delete')
                .set('Authorization', token)
                .send({ tagId: "51d1af07-ee43-42b1-9df5-923c3d677302", contactId: "4592b786-0652-4e10-b4f7-dfdf805d1f2e" });
            expect(res.status).toBe(200);
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/taggings/secure/delete')
                .set('Authorization', token)
                .send({ tagId: "51d1af07-ee43-42b1-9df5-923c3d677302" }); // Missing contactId
            expect(res.status).toBe(400);
        }));
    });
});
