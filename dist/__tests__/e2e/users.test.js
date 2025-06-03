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
const users_routes_1 = require("../../src/modules/users/users.routes");
const supertest_1 = __importDefault(require("supertest"));
describe("USERS ROUTES", () => {
    let pool;
    let app;
    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0ODU1NTA2OSwiZXhwIjoxNzgwMDkxMDY5fQ.T6YRSBGET5L4kyoRAlAdUcA-5f-aKNByuecPH4QFNRY";
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
        const router = (0, users_routes_1.initializeUsersRouter)();
        app.use("/users", router);
        app.use(middlewareService.handleErrors.bind(middlewareService));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
        Container_1.default.clear();
    }));
    describe("POST /users/verify-email", () => {
        // it("should return 200 and token when email is valid and not in use", async () => {
        //     const res = await request(app)
        //         .post("/users/verify-email")
        //         .send({ email: "brendan.soullens@gmail.com" });
        //     expect(res.status).toBe(200);
        //     expect(res.body.token).toBeDefined();
        // });
        it("should return 400 if email is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post("/users/verify-email")
                .send({});
            expect(res.status).toBe(400);
        }));
        // it("should return 400 if email is already in use", async () => {
        //     const res = await request(app)
        //         .post("/users/verify-email")
        //         .send({ email: "existing@example.com" });
        //     expect(res.status).toBe(400);
        // });
    });
    describe("POST /users/verified/create", () => {
        // it("should create a user and return 200", async () => {
        //     const res = await request(app)
        //         .post("/users/verified/create")
        //         .set("Authorization", verificationToken)
        //         .send({
        //             code: 123456,
        //             email: "test@gmail222.com",
        //             password: "carpincha",
        //             phone: "1234567890",
        //             name: "Create User"
        //         });
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe("User added.");
        // });
        it("should return 400 if any required field is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post("/users/verified/create")
                .set("Authorization", verificationToken)
                .send({ email: "fail@example.com", code: 123456 }); // Incomplete payload
            expect(res.status).toBe(400);
        }));
    });
    describe("GET /users/secure/resource", () => {
        it("should return current user data if token is valid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .get("/users/secure/resource")
                .set("Authorization", token);
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
        }));
    });
    describe("PUT /users/secure/account", () => {
        // it("should update user info and return 200", async () => {
        //     const res = await request(app)
        //         .put("/users/secure/account")
        //         .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc0ODU1NjQ4MiwiZXhwIjoxNzgwMDkyNDgyfQ.da-NLsiJucB-5Npb3cmGUJ4bN8NVbp8EZ8ecNH3oa3g")
        //         .send({ name: "Updated Name", phone: "1112223333" });
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe("User updated");
        // });
        it("should return 400 if trying to update password without oldPassword", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put("/users/secure/account")
                .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc0ODU1NjQ4MiwiZXhwIjoxNzgwMDkyNDgyfQ.da-NLsiJucB-5Npb3cmGUJ4bN8NVbp8EZ8ecNH3oa3g")
                .send({ password: "newpass123" });
            expect(res.status).toBe(400);
        }));
    });
    describe("PUT /users/verified/account", () => {
        // it("should update user with verification and return 200", async () => {
        //     const res = await request(app)
        //         .put("/users/verified/account/3")
        //         .set("Authorization", verificationToken)
        //         .send({
        //             code: 123456,
        //             email: "updated@example.com",
        //             password: "verifiedPass123"
        //         });
        //     expect(res.status).toBe(200);
        //     expect(res.body.message).toBe("User updated");
        // });
        it("should return 400 for invalid userId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .put("/users/verified/account/abc")
                .set("Authorization", verificationToken)
                .send({
                email: "updated@example.com",
                code: 123456
            });
            expect(res.status).toBe(400);
        }));
    });
    // describe("DELETE /users/secure/delete", () => {
    //     it("should delete user and return 200", async () => {
    //         const res = await request(app)
    //             .delete("/users/secure/delete")
    //             .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc0ODU1NjQ4MiwiZXhwIjoxNzgwMDkyNDgyfQ.da-NLsiJucB-5Npb3cmGUJ4bN8NVbp8EZ8ecNH3oa3g");
    //         expect(res.status).toBe(200);
    //         expect(res.body.message).toBe("User Deleted");
    //     });
    // });
    describe("POST /users/account-recovery", () => {
        it("should send recovery email and return token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post("/users/account-recovery")
                .send({ email: "brendan.soullens@gmail.com" });
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
        }));
        it("should return 400 if email does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app)
                .post("/users/account-recovery")
                .send({ email: "nonexistent@example.com" });
            expect(res.status).toBe(400);
        }));
    });
    describe("POST /users/login", () => {
        const testEmail = "brendan.soullens@gmail.com";
        const testPassword = "carpincha";
        it('should return 400 if email is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post("/users/login").send({ password: testPassword });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('All fields required');
        }));
        it('should return 400 if password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post("/users/login").send({ email: testEmail });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('All fields required');
        }));
        it('should return 400 if user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post("/users/login").send({
                email: 'nonexistent@example.com',
                password: 'irrelevant'
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Incorrect email or password');
        }));
        it('should return 400 if password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post("/users/login").send({
                email: testEmail,
                password: 'WrongPassword123!'
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Incorrect email or password');
        }));
        it('should return 200 and a token for valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app).post("/users/login").send({
                email: testEmail,
                password: testPassword
            });
            expect(res.status).toBe(200);
            expect(typeof res.body.token).toBe('string');
            expect(res.body.token.length).toBeGreaterThan(10);
        }));
    });
});
