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


describe("USERS ROUTES", () => {
    let pool: Pool
    let app: Express

    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYmQzNzc2NC00Y2QzLTRlNzktODVkMC01MGYxYzBjMzg0MjEiLCJpYXQiOjE3NDg5Njk2MDIsImV4cCI6MTc4MDUwNTYwMn0.JiTqY9FHBaSofTdUnrxmGOLODvNLKvmsqpmOzFA5mSU";
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

        app.use("/google", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
        await pool.end();
        const redisClient = Container.resolve<RedisClientType>("RedisClient")
        await redisClient.quit();
        Container.clear();
        
    })

    describe("GET GOOGLE CALENDARS", () => {
        it("should return a list of calendars", async() => {
            const res = await request(app)
            .get("/google/secure/calendars")
            .set("Authorization", token)

            console.log("res:::::: ", res.body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data")
        })
    })

    describe("GET GOOGLE CALENDARS EVENTS", () => {
        it("should return a list of calendars", async() => {
            const res = await request(app)
            .get("/google/secure/calendars/events/6e2b6fb1-5012-4dda-b4d6-6a8151b870ba")
            .set("Authorization", token)

            console.log("attendees::::", res.body.data[1].attendees)
            console.log("EVENTS:::", res.body.data)
    
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data")
        })
    })

    // describe("sync google  calendar", () => {
    //     it("should return a list of calendars", async() => {
    //         const res = await request(app)
    //         .get("/google/secure/calendars/sync/6e2b6fb1-5012-4dda-b4d6-6a8151b870ba")
    //         .set("Authorization", token)

            
    //         expect(res.status).toBe(200);
    //     })
    // })

    // describe("unSync google  calendar", () => {
    //     it("should return a list of calendars", async() => {
    //         const res = await request(app)
    //         .delete("/google/secure/calendars/sync/6e2b6fb1-5012-4dda-b4d6-6a8151b870ba")
    //         .set("Authorization", token)

            
    //         expect(res.status).toBe(200);
    //     })
    // })
})