"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const options = {
    openapi: "3.0.0"
};
const doc = {
    info: {
        title: 'CXplorers',
        description: 'Endpoints',
        version: '1.0.0',
    },
    host: 'cxplorers-app.up.railway.app',
    basePath: '/',
    schemes: ['https'],
    paths: {},
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: 'Enter JWT token with **Bearer** prefix. Example: "Bearer {token}"'
            }
        },
        schemas: {
            createUser: {
                email: "email",
                password: "password",
                name: "name",
                phone: "phone number",
                code: "code from users email"
            },
            updateUser: {
                phone: "phone",
                name: "name",
                password: "new passoword",
                oldPassword: "old password"
            },
            verifiedUpdateUser: {
                email: "new email",
                password: " new password",
                code: "code from users email"
            },
            accountRecovery: {
                email: "email"
            },
            createToken: {
                token: "token",
                userId: "uuid",
                type: "refresh or access",
                service: "google"
            },
            updateToken: {
                token: "new Token"
            }
        }
    },
};
const outputFile = './swagger.json';
const endpointsFiles = [
    // users //
    '../../modules/users/users.routes.ts'
];
(0, swagger_autogen_1.default)(options)(outputFile, endpointsFiles, doc);
