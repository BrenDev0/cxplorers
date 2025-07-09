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
import { RedisClientType } from 'redis';
import { initializeContactsRouter } from '../../src/modules/contacts/contacts.routes';
import { initializeTasksRouter } from '../../src/modules/tasks/tasks.routes';


describe("CONTACTS ROUTES", () => {
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

        const router = initializeTasksRouter();

        app.use("/tasks", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
      await pool.end();
      const redisClient = Container.resolve<RedisClientType>("RedisClient")
      await redisClient.quit();
      Container.clear();
      
  })

  describe('POST /tasks/secure/create', () => {
    // it('should return 200 and create a task with valid input', async () => {
    //   const res = await request(app)
    //     .post('/tasks/secure/create')
    //     .set('Authorization', token)
    //     .send({
    //       contactId: "7a4557aa-680b-473c-a4e0-028925f001e8",
    //       businessUserId: "b860e80a-1753-4adb-8037-9298e927dbad",
    //       taskTitle: 'Follow up with lead',
    //       taskDueDate: '2025-06-14T10:00:00.000Z',
    //     });

    //   expect(res.status).toBe(200);
    //   expect(res.body.message).toBe('Task added');
    // });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/tasks/secure/create')
        .set('Authorization', token)
        .send({
          taskTitle: 'Missing fields',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("All fields required");
    });
  });


  describe('GET /tasks/secure/resource/:taskId', () => {
    it('should return 200 and a task resource for a valid taskId', async () => {
      const res = await request(app)
        .get(`/tasks/secure/resource/7ea129b6-f37e-4e9b-889f-7dec187b1647`)
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('taskTitle');
    });

    it('should return 400 for invalid taskId format', async () => {
      const res = await request(app)
        .get('/tasks/secure/resource/invalid-uuid')
        .set('Authorization', token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid ID format');
    });

    it('should return 404 if task does not exist', async () => {
      const res = await request(app)
        .get('/tasks/secure/resource/00000000-0000-0000-0000-000000000000')
        .set('Authorization', token);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Task not found');
    });
  });


  describe('GET /tasks/secure/collection?filter=user', () => {
    it('should return 200 and tasks assigned to the user', async () => {
      const res = await request(app)
        .get('/tasks/secure/collection?filter=user')
        .set('Authorization', token);

        console.log(res.body)
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 400 if query param is invalid', async () => {
      const res = await request(app)
        .get('/tasks/secure/collection?filter=invalid')
        .set('Authorization', token);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('invalid query');
    });

    it('should return 200 and tasks assigned to the user', async () => {
      const res = await request(app)
        .get('/tasks/secure/collection?filter=business')
        .set('Authorization', token);

        console.log(res.body)
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /tasks/secure/:taskId', () => {
    it('should return 200 and update the task', async () => {
      const res = await request(app)
        .put(`/tasks/secure/7ea129b6-f37e-4e9b-889f-7dec187b1647`)
        .set('Authorization', token)
        .send({
          taskTitle: 'Updated title',
          taskDescription: 'Updated description',
          taskDueDate: '2025-06-15T10:00:00.000Z',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task updated');
    });

    it('should return 400 for invalid taskId', async () => {
      const res = await request(app)
        .put('/tasks/secure/invalid-id')
        .set('Authorization', token)
        .send({ taskTitle: 'Fix format' });

      expect(res.status).toBe(400);
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app)
        .put('/tasks/secure/00000000-0000-0000-0000-000000000000')
        .set('Authorization', token)
        .send({ taskTitle: 'Nonexistent' });

      expect(res.status).toBe(404);
    });
  });


  describe('DELETE /tasks/secure/:taskId', () => {
    it('should return 200 and delete the task', async () => {
      const res = await request(app)
        .delete(`/tasks/secure/bebba57d-de86-401a-bfcb-0bea87dcc10a`)
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task deleted.');
    });

    it('should return 400 for invalid taskId', async () => {
      const res = await request(app)
        .delete('/tasks/secure/not-a-uuid')
        .set('Authorization', token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if task does not exist', async () => {
      const res = await request(app)
        .delete('/tasks/secure/00000000-0000-0000-0000-000000000000')
        .set('Authorization', token);

      expect(res.status).toBe(404);
    });
  });


})