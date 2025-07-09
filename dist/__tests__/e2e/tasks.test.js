"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = require("pg");
const createApp_1 = __importDefault(require("../../src/createApp"));
const Container_1 = __importDefault(require("../../src/core/dependencies/Container"));
const configureContainer_1 = require("../../src/core/dependencies/configureContainer");
const supertest_1 = __importDefault(require("supertest"));
const tasks_routes_1 = require("../../src/modules/tasks/tasks.routes");
describe("CONTACTS ROUTES", () => {
    let pool;
    let app;
    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWUzNjRkMS02MTU1LTRiNzUtYjAwMy1iM2E1YmFjMjhlYzYiLCJidXNpbmVzc0lkIjoiM2EwNDVhMTEtYWY5Ni00ZTM1LTk5MTUtYzcyOGEzYjBlYjJhIiwiaWF0IjoxNzUxOTkxMTYwLCJleHAiOjE3ODM1MjcxNjB9.HCy_dqPjFQwpti6RfRjeEEO-eAV69R7XqysrbEG4sbs";
    const verificationToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJpZmljYXRpb25Db2RlIjoxMjM0NTYsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.uBTTn3CM6VVCN0fuN9LOOEodHzxUNGqaScx7HFwSi-Q";
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        pool = new pg_1.Pool({
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false,
            }
        });
        app = (0, createApp_1.default)();
        yield (0, configureContainer_1.configureContainer)(pool);
        const middlewareService = Container_1.default.resolve("MiddlewareService");
        const router = (0, tasks_routes_1.initializeTasksRouter)();
        app.use("/tasks", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
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
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/tasks/secure/create')
                .set('Authorization', token)
                .send({
                taskTitle: 'Missing fields',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch("All fields required");
        }));
    });
    describe('GET /tasks/secure/resource/:taskId', () => {
        it('should return 200 and a task resource for a valid taskId', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/tasks/secure/resource/7ea129b6-f37e-4e9b-889f-7dec187b1647`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('taskTitle');
        }));
        it('should return 400 for invalid taskId format', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/tasks/secure/resource/invalid-uuid')
                .set('Authorization', token);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid ID format');
        }));
        it('should return 404 if task does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/tasks/secure/resource/00000000-0000-0000-0000-000000000000')
                .set('Authorization', token);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Task not found');
        }));
    });
    describe('GET /tasks/secure/collection?filter=user', () => {
        it('should return 200 and tasks assigned to the user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/tasks/secure/collection?filter=user')
                .set('Authorization', token);
            console.log(res.body);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        }));
        it('should return 400 if query param is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/tasks/secure/collection?filter=invalid')
                .set('Authorization', token);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('invalid query');
        }));
        it('should return 200 and tasks assigned to the user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get('/tasks/secure/collection?filter=business')
                .set('Authorization', token);
            console.log(res.body);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        }));
    });
    describe('PUT /tasks/secure/:taskId', () => {
        it('should return 200 and update the task', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put(`/tasks/secure/7ea129b6-f37e-4e9b-889f-7dec187b1647`)
                .set('Authorization', token)
                .send({
                taskTitle: 'Updated title',
                taskDescription: 'Updated description',
                taskDueDate: '2025-06-15T10:00:00.000Z',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Task updated');
        }));
        it('should return 400 for invalid taskId', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put('/tasks/secure/invalid-id')
                .set('Authorization', token)
                .send({ taskTitle: 'Fix format' });
            expect(res.status).toBe(400);
        }));
        it('should return 404 if task not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put('/tasks/secure/00000000-0000-0000-0000-000000000000')
                .set('Authorization', token)
                .send({ taskTitle: 'Nonexistent' });
            expect(res.status).toBe(404);
        }));
    });
    describe('DELETE /tasks/secure/:taskId', () => {
        it('should return 200 and delete the task', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete(`/tasks/secure/bebba57d-de86-401a-bfcb-0bea87dcc10a`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Task deleted.');
        }));
        it('should return 400 for invalid taskId', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/tasks/secure/not-a-uuid')
                .set('Authorization', token);
            expect(res.status).toBe(400);
        }));
        it('should return 404 if task does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete('/tasks/secure/00000000-0000-0000-0000-000000000000')
                .set('Authorization', token);
            expect(res.status).toBe(404);
        }));
    });
});
