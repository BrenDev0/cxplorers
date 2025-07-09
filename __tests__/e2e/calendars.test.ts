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
import { initializeCalendarsRouter } from '../../src/modules/calendars/calendars.routes';
import { RedisClientType } from 'redis';


describe("USERS ROUTES", () => {
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

        const router = initializeCalendarsRouter();

        app.use("/calendars", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
        await pool.end();
        const redisClient = Container.resolve<RedisClientType>("RedisClient")
        await redisClient.quit();
        Container.clear();
        
    })

    describe('POST /calendars/secure/create', () => {
    it('should create a new calendar and return 200', async () => {
      const res = await request(app)
        .post('/calendars/secure/create')
        .set('Authorization', token)
        .send({ 
            calendarReferenceId: '31ab5f2d1d183690b964a7bc9ba1b8fbd94e280f24823659e972ca6be393bda2@group.calendar.google.com', 
            title: 'testing cxplorers' ,
            description: 'test calendar',
            backgroundColor: '#4986e7',
            foregroundColor: '#000000',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Calendar added.');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/calendars/secure/create')
        .set('Authorization', token)
        .send({ title: 'Missing referenceId' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /secure/calendars/resource/:calendarId', () => {
    // it('should return a calendar by ID for authorized user', async () => {
    //   const res = await request(app)
    //     .get(`/calendars/secure/resource/19db0c18-2121-44d1-bdec-794d21cbf599`)
    //     .set('Authorization', token);

    //   expect(res.status).toBe(200);
    //   expect(res.body.data).toHaveProperty('title');
    // });

    it('should return 404 if calendar does not exist', async () => {
      const res = await request(app)
        .get('/calendars/secure/resource/19db0c18-2121-44d1-bdec-794d21cbf59a')
        .set('Authorization', token);

      expect(res.status).toBe(404);
    });

    // it('should return 403 if user is not authorized to access calendar', async () => {
    //   const res = await request(app)
    //     .get(`/calendars/secure/resource/2`)
    //     .set('Authorization', token);

    //   expect(res.status).toBe(403);
    // });
  });

  describe('GET /calendars/secure/collection', () => {
    it('should return a collection of calendars for the user', async () => {
      const res = await request(app)
        .get('/calendars/secure/collection')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /calendars/secure/:calendarId', () => {
    // it('should delete a calendar and return 200', async () => {
    //   const res = await request(app)
    //     .delete(`/calendars/secure/21c901c0-7d3b-4a6c-823e-353eb0d52b24`)
    //     .set('Authorization', token);

    //   expect(res.status).toBe(200);
    // });

    it('should return 404 if calendar does not exist', async () => {
      const res = await request(app)
        .delete('/calendars/secure/21c901c0-7d3b-4a6c-823e-353eb0d52b2a')
        .set('Authorization', token);

      expect(res.status).toBe(404);
    });

    // it('should return 403 if user tries to delete another user\'s calendar', async () => {
    //   const res = await request(app)
    //     .delete(`/calendars/secure/1`)
    //     .set('Authorization', token);

    //   expect(res.status).toBe(403);
    // });
  });
})