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
            login: {
                email: "email",
                password: "password"
            },
            accountRecovery: {
                email: "email"
            },
            verifyEmail: {
                email: "new email"
            },
            createToken: {
                token: "token",
                userId: "uuid",
                type: "refresh or access",
                service: "google"
            },
            updateToken: {
                token: "new Token"
            },
            createCalendar: {
                referenceId: "id from google",
                title: "summary from google",
                description: "from google default null",
                backgroundColor: "from google default null",
                forgroundColor: "from google default null"
            },
            createContact: {
                firstName: "required",
                lastName: "optional",
                email: "optional",
                phone: "optional"
            },
            updateContact: {
                firstName: "optional",
                lastName: "optional",
                email: "optional",
                phone: "optional"
            }
        }
    },
};
const outputFile = './swagger.json';
const endpointsFiles = [
    '../../modules/calendars/calendars.routes.ts',
    '../../modules/contacts/contacts.routes.ts',
    '../../modules/events/events.routes.ts',
    '../../modules/google/google.routes.ts',
    '../../modules/tokens/tokens.routes.ts',
    '../../modules/users/users.routes.ts'
];
(0, swagger_autogen_1.default)(options)(outputFile, endpointsFiles, doc);
