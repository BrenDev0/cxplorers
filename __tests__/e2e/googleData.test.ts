import dotenv from 'dotenv';
dotenv.config();
import { Express } from 'express';
import { Pool } from 'pg';
import createApp from '../../src/createApp'
import Container from '../../src/core/dependencies/Container';
import { configureContainer } from '../../src/core/dependencies/configureContainer';
import MiddlewareService from '../../src/core/middleware/MiddlewareService';
import GoogleService from '../../src/modules/google/GoogleService';



describe("USERS ROUTES", () => {
    let pool: Pool
    let app: Express

    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYmQzNzc2NC00Y2QzLTRlNzktODVkMC01MGYxYzBjMzg0MjEiLCJpYXQiOjE3NDg5MDMxODEsImV4cCI6MTc4MDQzOTE4MX0.arPjmKvtSO49QXP1j79CA3Q8kWji2wB9gBO1EHq9lSk";
    const verificationToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoxMjM0NTYsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.uBTTn3CM6VVCN0fuN9LOOEodHzxUNGqaScx7HFwSi-Q"


    beforeAll(async() => {
        pool  = new Pool({
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false,
            }
        })

        app = createApp();

        await configureContainer(pool);
    })

    afterAll(async() =>  {
        await pool.end();
        Container.clear();
    })

    describe("GET GOOGLE DATA", () => {
        it("should return users google data", async() =>{
            const userId = "3bd37764-4cd3-4e79-85d0-50f1c0c38421"

            const googleService = Container.resolve<GoogleService>("GoogleService");
            const data = await googleService.getGoogleData(userId);
            console.log("::::::::::::", data)

            expect(data).toHaveProperty("token")
        })
    })
})
