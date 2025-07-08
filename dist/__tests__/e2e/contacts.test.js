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
const contacts_routes_1 = require("../../src/modules/contacts/contacts.routes");
describe("USERS ROUTES", () => {
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
        const router = (0, contacts_routes_1.initializeContactsRouter)();
        app.use("/contacts", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        const redisClient = Container_1.default.resolve("RedisClient");
        yield redisClient.quit();
        Container_1.default.clear();
    }));
    describe('POST /contacts/secure/create', () => {
        // it('should create a contact and return 200', async () => {
        //   const res = await request(app)
        //     .post('/contacts/secure/create')
        //     .set('Authorization', token)
        //     .send({
        //       firstName: 'Delete Me',
        //       email: 'carpincha@example.com',
        //       phone: '1234567890',
        //       contactType: "lead"
        //     });
        //   expect(res.status).toBe(200);
        //   expect(res.body.message).toBe('Contact added');
        // });
        it('should return 400 if firstName is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post('/contacts/secure/create')
                .set('Authorization', token)
                .send({
                email: 'no-firstname@example.com',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("All fields required");
        }));
    });
    describe('GET /contacts/secure/resource/:contactId', () => {
        const validContactId = "7a4557aa-680b-473c-a4e0-028925f001e8";
        const nonexistentContactId = "6a0789b7-f536-47c6-861f-796365f925e4";
        it('should return 200 and contact data for a valid contactId', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/contacts/secure/resource/${validContactId}`)
                .set('Authorization', token);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('firstName');
        }));
        it('should return 404 if contact does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/contacts/secure/resource/${nonexistentContactId}`)
                .set('Authorization', token);
            expect(res.status).toBe(404);
            expect(res.body.message).toMatch("Contact not found");
        }));
        //   it('should return 403 if user does not own the contact', async () => {
        //     const res = await request(app)
        //       .get(`/contacts/secure/resource/${otherUserContactId}`)
        //       .set('Authorization', token);
        //     expect(res.status).toBe(403);
        //     expect(res.body.message).toMatch(/Not authorized/);
        //   });
    });
    describe('GET /contacts/secure/collection', () => {
        it('should return 200 and contacts for user', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get(`/contacts/secure/collection`)
                .set('Authorization', token);
            console.log(res.body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
        }));
    });
    describe('PUT /contacts/secure/update/:contactId', () => {
        const validContactId = "7a4557aa-680b-473c-a4e0-028925f001e8";
        const nonexistentContactId = "833cba4d-4ea0-41f4-b9d9-510893ac7722";
        it('should update a contact and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put(`/contacts/secure/${validContactId}`)
                .set('Authorization', token)
                .send({
                firstName: 'UpdatedName',
                phone: '9999999999',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Contact updated');
        }));
        //   it('should return 403 if user does not own the contact', async () => {
        //     const res = await request(app)
        //       .put(`/contacts/secure/update/${otherUserContactId}`)
        //       .set('Authorization', token)
        //       .send({ firstName: 'ShouldFail' });
        //     expect(res.status).toBe(403);
        //     expect(res.body.message).toMatch(/Not authorized/);
        //   });
        it('should return 404 if contact not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put(`/contacts/secure/${nonexistentContactId}`)
                .set('Authorization', token)
                .send({ firstName: 'Ghost' });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Contact not found");
        }));
    });
    describe('DELETE /contacts/secure/delete/:contactId', () => {
        const validContactId = "843b3309-76af-46fa-b144-88743c22e438";
        const nonexistentContactId = "833cba4d-4ea0-41f4-b9d9-510893ac7722";
        //   it('should delete a contact and return 200', async () => {
        //     const res = await request(app)
        //       .delete(`/contacts/secure/${validContactId}`)
        //       .set('Authorization', token);
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe('Contact deleted');
        //   });
        //   it('should return 403 if user does not own the contact', async () => {
        //     const res = await request(app)
        //       .delete(`/contacts/secure/delete/${otherUserContactId}`)
        //       .set('Authorization', token);
        //     expect(res.status).toBe(403);
        //     expect(res.body.message).toMatch(/Not authorized/);
        //   });
        it('should return 404 if contact not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .delete(`/contacts/secure/${nonexistentContactId}`)
                .set('Authorization', token);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Contact not found");
        }));
    });
});
