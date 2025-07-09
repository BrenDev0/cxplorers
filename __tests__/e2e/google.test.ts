import dotenv from 'dotenv';
dotenv.config();
import { Express } from 'express';
import { Pool } from 'pg';
import createApp from '../../src/createApp'
import Container from '../../src/core/dependencies/Container';
import { configureContainer } from '../../src/core/dependencies/configureContainer';
import MiddlewareService from '../../src/core/middleware/MiddlewareService';
import request from 'supertest'
import { initializeTokensRouter } from '../../src/modules/tokens/tokens.routes';
import { initializeGoogleRouter } from '../../src/modules/google/google.routes';
import { RedisClientType } from 'redis';
import { initializeGoogleCalendarRouter } from '../../src/modules/google/calendar/google.calendar.routes';


describe("GOOGLE ROUTES", () => {
    let pool: Pool
    let app: Express

     const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWUzNjRkMS02MTU1LTRiNzUtYjAwMy1iM2E1YmFjMjhlYzYiLCJidXNpbmVzc0lkIjoiM2EwNDVhMTEtYWY5Ni00ZTM1LTk5MTUtYzcyOGEzYjBlYjJhIiwiaWF0IjoxNzUxOTkxMTYwLCJleHAiOjE3ODM1MjcxNjB9.HCy_dqPjFQwpti6RfRjeEEO-eAV69R7XqysrbEG4sbs";
    const verificationToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoxMjM0NTYsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.uBTTn3CM6VVCN0fuN9LOOEodHzxUNGqaScx7HFwSi-Q"


    beforeAll(async() => {
        pool  = new Pool({
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false,
            }
        })

        app = createApp();

        await configureContainer(pool, process.env.REDIS_URL);
        const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");

        const router = initializeGoogleRouter();
        const calendarRouter = initializeGoogleCalendarRouter();

        app.use("/google", router)
        app.use("/google/calendars", calendarRouter)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
        await pool.end();
        const redisClient = Container.resolve<RedisClientType>("RedisClient")
        await redisClient.quit();
        Container.clear();
        
    })

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

    describe("sync google  calendar", () => {
        it("should sync calendar", async() => {
            const res = await request(app)
            .get("/google/calendars/secure/sync/87cb1db8-792a-43b4-b05f-d76044225117")
            .set("Authorization", token)

            
            expect(res.status).toBe(200);
        })
    })

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
})