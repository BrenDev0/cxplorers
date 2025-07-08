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
import { initializeOpportunitiesRouter } from '../../src/modules/opportunities/opportunities.routes';
import OpportunitiesService from '../../src/modules/opportunities/OpportunitiesService';


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

        const router = initializeOpportunitiesRouter()

        app.use("/opportunities", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
        await pool.end();
        const redisClient = Container.resolve<RedisClientType>("RedisClient")
        await redisClient.quit();
        Container.clear();
        
    })

    describe('POST /opportunities/secure/create', () => {
  // it('should create a new opportunity and return 200', async () => {
  //   const body = { 
  //     contactId: "7a4557aa-680b-473c-a4e0-028925f001e8", 
  //     stageId: "9357af0f-70dc-4393-8fa0-c827ef1ec428",
  //     opportunityValue: 50000,
  //     opportunityName: "testing" 
  //   };
  //   const res = await request(app)
  //     .post('/opportunities/secure/create')
  //     .set('Authorization', token)
  //     .send(body);

  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toBe('Opportunity added.');
  // });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/opportunities/secure/create')
      .set('Authorization', token)
      .send({});

    expect(res.status).toBe(400);
  });

});

describe('GET /opportunities/secure/resource/:opportunityId', () => {
  it('should return 200 and opportunity resource if authorized', async () => {
    const res = await request(app)
      .get(`/opportunities/secure/resource/546e39dc-41cc-45d9-83e2-9eb962c03fea`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('stageId');
  });

  it('should return 400 for invalid opportunityId format', async () => {
    const res = await request(app)
      .get('/opportunities/secure/resource/invalid-id')
      .set('Authorization', token);

    expect(res.status).toBe(400);
  });
});

describe('GET /opportunities/secure/collection/:stageId', () => {
  it('should return 200 and a list of opportunities', async () => {
    const res = await request(app)
      .get(`/opportunities/secure/collection/9357af0f-70dc-4393-8fa0-c827ef1ec428`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // it('should return 400 for invalid stageId format', async () => {
  //   const res = await request(app)
  //     .get('/opportunities/secure/collection/123e4567-e89b-12d3-a456-426614174000B')
  //     .set('Authorization', token);

  //   expect(res.status).toBe(400);
  // });

});

describe('PUT /secure/opportunities/:opportunityId', () => {
  it('should update opportunity and return 200', async () => {
    const body = { opportunityValue: 5000, notes: "Updated opportunity" };
    const res = await request(app)
      .put(`/opportunities/secure/546e39dc-41cc-45d9-83e2-9eb962c03fea`)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Opportunity updated');
  });

  it('should return 400 for invalid opportunityId format', async () => {
    const res = await request(app)
      .put('/opportunities/secure/invalid-id')
      .set('Authorization', token)
      .send({ opportunityValue: 5000 });

    expect(res.status).toBe(400);
  });

});

describe('DELETE /secure/opportunities/:opportunityId', () => {
  // it('should delete opportunity and return 200', async () => {
  //   const res = await request(app)
  //     .delete(`/opportunities/secure/25b61adc-1f22-4846-8c13-16356f5ba642`)
  //     .set('Authorization', token);

  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toBe('Opportunity deleted');
  // });

  it('should return 400 for invalid opportunityId format', async () => {
    const res = await request(app)
      .delete('/opportunities/secure/invalid-id')
      .set('Authorization', token);

    expect(res.status).toBe(400);
  });

});

})