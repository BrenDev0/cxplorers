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
import { initializeTagsRouter } from '../../src/modules/tags/tags.routes';
import { initializeTaggingsRouter } from '../../src/modules/tags/taggings/taggings.routes';


describe("TAGGINGS ROUTES", () => {
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

        await configureContainer(pool);
        const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");

        const router = initializeTaggingsRouter();

        app.use("/taggings", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
      await pool.end();
      const redisClient = Container.resolve<RedisClientType>("RedisClient")
      await redisClient.quit();
      Container.clear();
      
  })


    describe('POST /taggings/secure/create', () => {
        // it('should return 200 when a tagging is created successfully', async () => {
        //     const res = await request(app)
        //     .post('/taggings/secure/create')
        //     .set('Authorization', token)
        //     .send({ tagId: "51d1af07-ee43-42b1-9df5-923c3d677302", contactId: "4592b786-0652-4e10-b4f7-dfdf805d1f2e" });

        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe('Tagging added');
        // });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
            .post('/taggings/secure/create')
            .set('Authorization', token)
            .send({ contactId: "4592b786-0652-4e10-b4f7-dfdf805d1f2e" }); 

            expect(res.status).toBe(400);
            expect(res.body.message).toBeDefined();
        });
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
        it('should return 200 when tagging is deleted successfully', async () => {
            const res = await request(app)
            .delete('/taggings/secure/delete')
            .set('Authorization', token)
            .send({ tagId: "51d1af07-ee43-42b1-9df5-923c3d677302", contactId: "4592b786-0652-4e10-b4f7-dfdf805d1f2e" });

            expect(res.status).toBe(200);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
            .delete('/taggings/secure/delete')
            .set('Authorization', token)
            .send({ tagId: "51d1af07-ee43-42b1-9df5-923c3d677302" }); // Missing contactId

            expect(res.status).toBe(400);
        });

        
    });

})
