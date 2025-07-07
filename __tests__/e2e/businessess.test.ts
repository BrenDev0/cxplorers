import dotenv from 'dotenv';
dotenv.config();
import { Express } from 'express';
import { Pool } from 'pg';
import createApp from '../../src/createApp'
import Container from '../../src/core/dependencies/Container';
import { configureContainer } from '../../src/core/dependencies/configureContainer';
import MiddlewareService from '../../src/core/middleware/MiddlewareService';
import request from 'supertest'
import { RedisClientType } from 'redis';
import { initializeBusinessUsersRouter } from '../../src/modules/businesses/businessUsers/businessUsers.routes';
import { initializeBusinessesRouter } from '../../src/modules/businesses/businesses.routes';


describe("USERS ROUTES", () => {
    let pool: Pool
    let app: Express

    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWUzNjRkMS02MTU1LTRiNzUtYjAwMy1iM2E1YmFjMjhlYzYiLCJpYXQiOjE3NTE5MTAyMDQsImV4cCI6MTc4MzQ0NjIwNH0.pYJu3dA6Lc1EN5LBdMt0gcPJX_cAqJ0_AMLsoy0BZjo";
    const verificationToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoxMjM0NTYsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.uBTTn3CM6VVCN0fuN9LOOEodHzxUNGqaScx7HFwSi-Q"
    const nonAdminToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYmQzNzc2NC00Y2QzLTRlNzktODVkMC01MGYxYzBjMzg0MjEiLCJpYXQiOjE3NDg5Njk2MDIsImV4cCI6MTc4MDUwNTYwMn0.JiTqY9FHBaSofTdUnrxmGOLODvNLKvmsqpmOzFA5mSU";
    const businessToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWUzNjRkMS02MTU1LTRiNzUtYjAwMy1iM2E1YmFjMjhlYzYiLCJidXNpbmVzc0lkIjoiM2EwNDVhMTEtYWY5Ni00ZTM1LTk5MTUtYzcyOGEzYjBlYjJhIiwiaWF0IjoxNzUxOTE1MzcwLCJleHAiOjE3NTI1MjAxNzB9.ONgXdCRX5BhGS3Sh9H6M9W8QRaJNj-Ea3Ki2BUVOIKA"


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

        const router = initializeBusinessesRouter();

        app.use("/businesses", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
        await pool.end();
        const redisClient = Container.resolve<RedisClientType>("RedisClient")
        await redisClient.quit();
        Container.clear();
        
    })

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

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
            .post('/businesses/secure/create')
            .set('Authorization', token)
            .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('All fields required');
        });
    });


    describe('GET /businesses/secure/resource', () => {
        it('should return 200 and business data for valid ID and permissions', async () => {
            const res = await request(app)
            .get(`/businesses/secure/resource`)
            .set('Authorization', businessToken);

            console.log(res.body, "RESPONSE::::::::::::")
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('businessId');
        });
    });


   
})