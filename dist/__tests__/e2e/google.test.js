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
const google_routes_1 = require("../../src/modules/google/google.routes");
describe("GOOGLE ROUTES", () => {
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
        const router = (0, google_routes_1.initializeGoogleRouter)();
        app.use("/google", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    // describe("GET GOOGLE CALENDARS", () => {
    //     it("should return a list of calendars", async() => {
    //         const res = await request(app)
    //         .get("/google/secure/calendars")
    //         .set("Authorization", token)
    //         expect(res.status).toBe(200);
    //         expect(res.body).toHaveProperty("data")
    //     })
    // })
    // describe("GET GOOGLE CALENDARS EVENTS", () => {
    //     it("should return a list of events", async() => {
    //         const res = await request(app)
    //         .get("/google/secure/calendars/events/6e2b6fb1-5012-4dda-b4d6-6a8151b870ba")
    //         .set("Authorization", token)
    //         console.log(res.body)
    //         expect(res.status).toBe(200);
    //         expect(res.body).toHaveProperty("data")
    //     })
    // })
    // describe("sync google  calendar", () => {
    //     it("should sync calendar", async() => {
    //         const res = await request(app)
    //         .get("/google/secure/calendars/sync/6e2b6fb1-5012-4dda-b4d6-6a8151b870ba")
    //         .set("Authorization", token)
    //         expect(res.status).toBe(200);
    //     })
    // })
    // describe("unSync google  calendar", () => {
    //     it("should cancel sync", async() => {
    //         const res = await request(app)
    //         .delete("/google/secure/calendars/sync/6e2b6fb1-5012-4dda-b4d6-6a8151b870ba")
    //         .set("Authorization", token)
    //         expect(res.status).toBe(200);
    //     })
    // })
    // describe("create google calendar event", () => {
    //     const start = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    //     const end = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
    //     it("should create event", async() => {
    //         const res = await request(app)
    //         .post("/google/secure/calendars/events/6e2b6fb1-5012-4dda-b4d6-6a8151b870ba")
    //         .set("Authorization", token)
    //         .send({
    //             startTime: start,
    //             endTime: end,
    //             summary: "added event from jest",
    //             attendees: [
    //                 {
    //                     email: "lahey1991@gmail.com"
    //                 },
    //                 {
    //                     email: "webpropiedadesmeridamx@gmail.com"
    //                 }
    //             ]
    //         })
    //         expect(res.status).toBe(200);
    //     })
    // })
    //  describe("update google calendar event", () => {
    //     const start = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    //     const end = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
    //     it("should create event", async() => {
    //         const res = await request(app)
    //         .put("/google/secure/calendars/events/5589fa92-2ba6-429a-9c26-7b412b5d133e")
    //         .set("Authorization", token)
    //         .send({
    //             startTime: start,
    //             endTime: end,
    //             summary: "updated event from jest",
    //             attendees: [
    //                 {
    //                     email: "lahey1991@gmail.com"
    //                 },
    //                 {
    //                     email: "webpropiedadesmeridamx@gmail.com"
    //                 }
    //             ]
    //         })
    //         expect(res.status).toBe(200);
    //     })
    // })
    // describe("delete google calendar event", () => {
    //     it("should delete event", async() => {
    //         const res = await request(app)
    //         .delete("/google/secure/calendars/events/a6682149-4442-4e1c-9c57-f884c03276e1")
    //         .set("Authorization", token)
    //         expect(res.status).toBe(200);
    //     })
    // })
});
