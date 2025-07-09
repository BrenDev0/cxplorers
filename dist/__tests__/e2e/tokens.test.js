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
const tokens_routes_1 = require("../../src/modules/tokens/tokens.routes");
describe("USERS ROUTES", () => {
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
        const router = (0, tokens_routes_1.initializeTokensRouter)();
        app.use("/tokens", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    const baseUrl = "/tokens/secure";
    const authHeader = { Authorization: token };
    describe("TokensController", () => {
        describe("POST /secure/tokens", () => {
            it("should create a token successfully", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .post(`${baseUrl}/create`)
                    .set(authHeader)
                    .send({
                    token: "1//05WY9k_pUKZygCgYIARAAGAUSNwF-L9IrOnMBzLMYOPVxt8mLco_bCZcxQrSrj924MBqT6WDVzaYFs3lmfIl-B9ugXjksGNBYBNU",
                    type: "refresh",
                    service: "google"
                });
                expect(res.status).toBe(200);
                expect(res.body.message).toBe("Token added.");
            }));
            it("should return 400 if required fields are missing", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .post(`${baseUrl}/create`)
                    .set(authHeader)
                    .send({
                    type: "access"
                });
                expect(res.status).toBe(400);
                expect(res.body.message).toBe("All fields required");
            }));
        });
        describe("GET /tokens/secure/resource/:tokenId", () => {
            it("should return 200 if resource exists", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .get(`${baseUrl}/resource/e4fd7a44-dc60-4293-91b0-d46015f435ad`)
                    .set(authHeader);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("data");
            }));
            it("should return 404 if resource does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .get(`${baseUrl}/resource/e96f1433-3d7b-4d70-bf35-e419bfb7929b`)
                    .set(authHeader);
                expect(res.status).toBe(404);
            }));
            it("should return 400 for invalid UUID format", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .get(`${baseUrl}/resource/invalid-uuid`)
                    .set(authHeader);
                expect(res.status).toBe(400);
            }));
        });
        describe("PUT /secure/tokens/:tokenId", () => {
            // it("should update a token if user is authorized", async () => {
            //   const res = await request(app)
            //     .put(`${baseUrl}/297f8dc1-221f-4884-b549-988cb33c5e82`)
            //     .set(authHeader)
            //     .send({ token: "updated-token-value" });
            //   expect(res.status).toBe(200);
            //   expect(res.body.message).toBe("token updated");
            // });
            it("should return 403 if user is not authorized", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .put(`${baseUrl}/1`)
                    .set(authHeader)
                    .send({ token: "unauthorized-update" });
                expect(res.status).toBe(403);
            }));
            it("should return 404 if token not found", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .put(`${baseUrl}/e96f1433-3d7b-4d70-bf35-e419bfb7929b`)
                    .set(authHeader)
                    .send({ token: "new-token" });
                expect(res.status).toBe(404);
            }));
        });
        describe("DELETE /secure/tokens/:tokenId", () => {
            it("should delete a token successfully", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .delete(`${baseUrl}/297f8dc1-221f-4884-b549-988cb33c5e82`)
                    .set(authHeader);
                expect(res.status).toBe(200);
                expect(res.body.message).toBe("Token deleted");
            }));
            it("should return 403 if user is not authorized", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .delete(`${baseUrl}/297f8dc1-221f-4884-b549-988cb33c5e85`)
                    .set(authHeader);
                expect(res.status).toBe(403);
            }));
            it("should return 404 if token not found", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(app)
                    .delete(`${baseUrl}/e96f1433-3d7b-4d70-bf35-e419bfb7929b`)
                    .set(authHeader);
                expect(res.status).toBe(404);
            }));
        });
    });
});
