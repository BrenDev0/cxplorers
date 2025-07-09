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
                contactType: "required",
                lastName: "optional",
                email: "optional",
                phone: "optional"
            },
            updateContact: {
                firstName: "optional",
                contactType: "optional",
                lastName: "optional",
                email: "optional",
                phone: "optional"
            },
            createEvent: {
                summary: "title required",
                startTime: "isoDateString required",
                endTime: "isoDateString required",
                attendees: [{ email: "attendees is optional" }]
            },
            createPipeline: {
                name: "required",
                inPieChart: true,
                inFunnelChart: true,
                stages: [{
                        name: "required",
                        pipelineId: "required",
                        position: 1,
                        inPieChart: true,
                        inFunnelChart: true
                    }]
            },
            updatePipeline: {
                name: "optional",
                inPieChart: true,
                inFunnelChart: true,
                stages: [{
                        name: "required",
                        stageId: "required",
                        pipelineId: "required",
                        position: 1,
                        inPieChart: true,
                        inFunnelChart: true
                    }]
            },
            createOpportunity: {
                stageId: "required",
                contactId: "required",
                opportunityValue: "optional",
                notes: "optional",
                opportunityName: "optional",
                opportunitySource: "optional",
                opportunityStatus: "optional",
                opportunityBusinessName: "optional",
                userId: "optional"
            },
            updateOpportunity: {
                opportunityValue: "optional",
                notes: "optional",
                opportunityName: "optional",
                opportunitySource: "optional",
                opportunityStatus: "optional",
                opportunityBusinessName: "optional",
                userId: "optional"
            },
            createBusiness: {
                businessLogo: "optional",
                businessName: "optional",
                legalName: "required",
                businessEmail: "required",
                businessPhone: "optional",
                brandedDomain: "optional",
                businessWebsite: "optional",
                businessNiche: "optional",
                platformLanguage: "optional",
                communicationLanguage: "optional",
            },
            updateBusiness: {
                businessLogo: "optional",
                businessName: "optional",
                legalName: "optional",
                businessEmail: "optional",
                businessPhone: "optional",
                brandedDomain: "optional",
                businessWebsite: "optional",
                businessNiche: "optional",
                platformLanguage: "optional",
                communicationLanguage: "optional",
            },
            createBusinessUser: {
                email: "required",
                name: "required",
                password: "required",
                phone: "required",
                role: "user || admin"
            },
            createPermissions: {
                permissions: [
                    {
                        moduleName: "calendar || contacts",
                        action: "write || read"
                    }
                ]
            },
            createTask: {
                contactId: "required",
                businessUserId: "required",
                taskTitle: "required",
                taskDescrition: "optional",
                taskDueDate: "required ISODATESTRING"
            },
            updateTask: {
                businessUserId: "optional",
                taksTitle: "optional",
                taskDescription: "optional",
                taskDueDate: "optional ISODATESTRING"
            }
        }
    },
};
const outputFile = './swagger.json';
const endpointsFiles = [
    '../../modules/businesses/businesses.routes.ts',
    '../../modules/businesses/businessUsers/businessUsers.routes.ts',
    '../../modules/calendars/calendars.routes.ts',
    '../../modules/contacts/contacts.routes.ts',
    '../../modules/calendars/events/events.routes.ts',
    '../../modules/google/google.routes.ts',
    '../../modules/google/calendar/google.calendar.routes.ts',
    '../../modules/opportunities/opportunities.routes.ts',
    '../../modules/opportunities/pipelines/pipelines.routes.ts',
    '../../modules/opportunities/stages/stages.routes.ts',
    '../../modules/permissions/permissions.routes.ts',
    '../../modules/tasks/tasks.routes.ts',
    '../../modules/tokens/tokens.routes.ts',
    '../../modules/users/users.routes.ts'
];
(0, swagger_autogen_1.default)(options)(outputFile, endpointsFiles, doc);
