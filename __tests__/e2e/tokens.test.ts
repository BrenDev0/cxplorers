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
        const middlewareService = Container.resolve<MiddlewareService>("MiddlewareService");

        const router = initializeTokensRouter();

        app.use("/tokens", router)

        app.use(middlewareService.handleErrors.bind(middlewareService))
    })

    afterAll(async() =>  {
        await pool.end();
        Container.clear();
    })


const baseUrl = "/tokens/secure";
const authHeader = { Authorization: token };

describe("TokensController", () => {
  describe("POST /secure/tokens", () => {
    // it("should create a token successfully", async () => {
    //   const res = await request(app)
    //     .post(`${baseUrl}/create`)
    //     .set(authHeader)
    //     .send({
    //       token: "1//055b09mnpFHQICgYIARAAGAUSNwF-L9IrU6vFnsKp0GeOIzw0m4cdDNQ2HPDN4Ti-I0IO1a-IWYtN_GiEFfphuksST2OXCP2ylg8",
    //       type: "refresh",
    //       service: "google"
    //     });

    //   expect(res.status).toBe(200);
    //   expect(res.body.message).toBe("Token added.");
    // });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post(`${baseUrl}/create`)
        .set(authHeader)
        .send({
          type: "access"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields required");
    });
  });

  describe("GET /tokens/secure/resource/:tokenId", () => {
    it("should return 200 if resource exists", async () => {
      const res = await request(app)
        .get(`${baseUrl}/resource/e4fd7a44-dc60-4293-91b0-d46015f435ad`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });

    it("should return 404 if resource does not exist", async () => {
      const res = await request(app)
        .get(`${baseUrl}/resource/e96f1433-3d7b-4d70-bf35-e419bfb7929b`)
        .set(authHeader);

      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid UUID format", async () => {
      const res = await request(app)
        .get(`${baseUrl}/resource/invalid-uuid`)
        .set(authHeader);

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /secure/tokens/:tokenId", () => {
    // it("should update a token if user is authorized", async () => {
    //   const res = await request(app)
    //     .put(`${baseUrl}/297f8dc1-221f-4884-b549-988cb33c5e82`)
    //     .set(authHeader)
    //     .send({ token: "updated-token-value" });

    //   expect(res.status).toBe(200);
    //   expect(res.body.message).toBe("token updated");
    // });

    it("should return 403 if user is not authorized", async () => {
      const res = await request(app)
        .put(`${baseUrl}/1`)
        .set(authHeader)
        .send({ token: "unauthorized-update" });

      expect(res.status).toBe(403);
    });

    it("should return 404 if token not found", async () => {
      const res = await request(app)
        .put(`${baseUrl}/e96f1433-3d7b-4d70-bf35-e419bfb7929b`)
        .set(authHeader)
        .send({ token: "new-token" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /secure/tokens/:tokenId", () => {
    it("should delete a token successfully", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/297f8dc1-221f-4884-b549-988cb33c5e82`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Token deleted");
    });

    it("should return 403 if user is not authorized", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/297f8dc1-221f-4884-b549-988cb33c5e85`)
        .set(authHeader);

      expect(res.status).toBe(403);
    });

    it("should return 404 if token not found", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/e96f1433-3d7b-4d70-bf35-e419bfb7929b`)
        .set(authHeader);

      expect(res.status).toBe(404);
    });
  });
});

})