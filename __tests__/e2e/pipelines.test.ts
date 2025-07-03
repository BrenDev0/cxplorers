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
import { initializePipelinesRouter } from '../../src/modules/opportunities/pipelines/pipelines.routes';
import { pipeline } from 'stream';


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

        const router = initializePipelinesRouter()

        app.use("/pipelines", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
        await pool.end();
        const redisClient = Container.resolve<RedisClientType>("RedisClient")
        await redisClient.quit();
        Container.clear();
        
    })

    describe('POST /pipelines/secure/create', () => {
    // it('should return 200 and create a new pipeline with valid input', async () => {
    //   const res = await request(app)
    //     .post('/pipelines/secure/create')
    //     .set('Authorization', token)
    //     .send({ name: 'no stages' });

    //   expect(res.status).toBe(200);
    //   expect(res.body.message).toBe('pipeline added.');
    // });

    // it('should return 200 and create a new pipeline with stages', async () => {
    //   const res = await request(app)
    //     .post('/pipelines/secure/create')
    //     .set('Authorization', token)
    //     .send({ 
    //       name: 'pipeline with stages',
    //       stages: [{name: "stage one", position: 1}, {name: "stage 2", position: 2}] 
    //     });

    //   expect(res.status).toBe(200);
    //   expect(res.body.message).toBe('pipeline added.');
    // });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/pipelines/secure/create')
      .set('Authorization', token)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields required");
  });
})

describe('GET /pipelines/secure/resource/:pipelineId', () => {
    
  it('should return 200 and the pipeline data for a valid ID and authorized user', async () => {
    const res = await request(app)
      .get('/pipelines/secure/resource/78f5ed70-56af-461f-a891-6a712242fee3')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name');
  });

  it('should return 403 if user is not authorized to access the pipeline', async () => {
    const res = await request(app)
      .get('/pipelines/secure/resource/c0b4aff1-48f3-49e7-8f94-e2872fca22f7')
      .set('Authorization', token);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("User not authorized to perform this action");
  });

  it('should return 404 if pipeline is not found', async () => {
    const res = await request(app)
      .get('/pipelines/secure/resource/123e4567-e89b-12d3-a456-426614174000')
      .set('Authorization', token);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Pipeline not found');
  });
});

describe('PUT/pipelines/secure/:pipelineId', () => {
  // it('should return 200 and update the pipeline with allowed fields', async () => {
  //   const res = await request(app)
  //     .put('/pipelines/secure/11cff2f9-96fa-4439-8c18-959e2f46976a')
  //     .set('Authorization', token)
  //     .send({ name: 'Updated Pipeline' });

  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toBe('pipeline updated');
  // });

  it('should return 200 and update the pipeline and stages with allowed fields', async () => {
    const res = await request(app)
      .put('/pipelines/secure/11cff2f9-96fa-4439-8c18-959e2f46976a')
      .set('Authorization', token)
      .send({ 
        stages: [
          {
            pipelineId: "11cff2f9-96fa-4439-8c18-959e2f46976a",
            stageId: "3cf755a9-d471-4331-b6fc-60a25412b934",
            name: "Updated stage name6789",
            position: 3
          }
        ]
       });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('pipeline updated');
  });


  it('should return 404 if pipeline does not exist', async () => {
    const res = await request(app)
      .put('/pipelines/secure/123e4567-e89b-12d3-a456-426614174000')
      .set('Authorization', token)
      .send({ name: 'Will not update' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Pipeline not found');
  });
});

describe('DELETE /pipelines/secure/:pipelineId', () => {
//   it('should return 200 and delete the pipeline for authorized user', async () => {
//     const res = await request(app)
//       .delete('/pipelines/secure/49ee5d52-f263-470f-a7a7-aea4a420d1e9')
//       .set('Authorization', token);

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe('Pipeline deleted');
//   });

  it('should return 403 if user is not authorized to delete the pipeline', async () => {
    const res = await request(app)
      .delete('/pipelines/secure/c0b4aff1-48f3-49e7-8f94-e2872fca22f7')
      .set('Authorization', token);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("User not authorized to perform this action");
  });


});

})