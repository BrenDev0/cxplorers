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


describe("TAGS ROUTES", () => {
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

        const router = initializeTagsRouter();

        app.use("/tags", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
      await pool.end();
      const redisClient = Container.resolve<RedisClientType>("RedisClient")
      await redisClient.quit();
      Container.clear();
      
  })

  

  describe('POST /tags/secure/create', () => {
//   it('should return 200 and confirmation message when tag is successfully created', async () => {
//     const res = await request(app)
//       .post('/tags/secure/create')
//       .set('Authorization', token)
//       .send({ tag: 'new' });

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe('Tag added');
//   });

  it('should return 400 if tag is missing in request body', async () => {
    const res = await request(app)
      .post('/tags/secure/create')
      .set('Authorization', token)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("All fields required");
  });

});

describe('GET /tags/secure/resource/:tagId', () => {
  it('should return 200 and the tag data for a valid tagId', async () => {
    const res = await request(app)
      .get(`/tags/secure/resource/51d1af07-ee43-42b1-9df5-923c3d677302`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('tag');
  });

  it('should return 400 for invalid tagId format', async () => {
    const res = await request(app)
      .get('/tags/secure/resource/invalid-uuid')
      .set('Authorization', token);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Invalid ID format");
  });

 
});

describe('GET /secure/tags', () => {
  it('should return 200 and list of tags', async () => {
    const res = await request(app)
      .get('/tags/secure/collection')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

});

describe('PUT /tags/secure/:tagId', () => {
  it('should return 200 when tag is successfully updated', async () => {
    const res = await request(app)
      .put(`/tags/secure/51d1af07-ee43-42b1-9df5-923c3d677302`)
      .set('Authorization', token)
      .send({ tag: 'updated-tag' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tag updated');
  });

  it('should return 400 for invalid tagId format', async () => {
    const res = await request(app)
      .put('/tags/secure/not-a-uuid')
      .set('Authorization', token)
      .send({ tag: 'new' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Invalid ID format");
  });

});

describe('DELETE /secure/tags/:tagId', () => {
  it('should return 200 and confirmation message when tag is successfully deleted', async () => {
    const res = await request(app)
      .delete(`/tags/secure/40c80040-7aa6-48c3-97e8-8bce8bbeb1e1`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tag deleted');
  });

  it('should return 400 for invalid tagId format', async () => {
    const res = await request(app)
      .delete('/tags/secure/invalid-uuid')
      .set('Authorization', token);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Invalid ID format");
  });

 
});


})
