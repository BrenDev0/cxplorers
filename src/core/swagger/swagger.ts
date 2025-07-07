import swaggerAutogen from 'swagger-autogen';
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
      },
      createEvent:{
      summary: "title required",
      startTime: "isoDateString required",
      endTime: "isoDateString required",
      attendees: [{email: "attendees is optional"}]
     },
     createPipeline: {
      name: "required",
      stages: [{name: "stage 1", position: 1}]
     },

     updatePipeline: {
      name: "optional",
      stages: [{
        name: "required",
        stageId: "required",
        pipelineId: "required",
        position: "required"
      }]
     },
     createOpportunity: {
      stageId: "required",
      contactId: "required",
      opportunityValue: "optional",
      notes: "optional"
    },
    updateOpportunity: {
      opportunityValue: "optional",
      notes: "optional"
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

    updateBusiness:{
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
    }
    },
    createBusinessUser: {
      email: "required",
      password: "required",
      phone: "required",
      role: "required"
    },

    createPermissions: {
      permissions: [
        {
          moduleName: "calendar || contacts",
          action: "write || read"
        }
      ]
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
  '../../modules/opportunities/opportunities.routes.ts',
  '../../modules/opportunities/pipelines/pipelines.routes.ts',
  '../../modules/opportunities/stages/stages.routes.ts',
  '../../modules/permissions/permissions.routes.ts',
  '../../modules/tokens/tokens.routes.ts',
  '../../modules/users/users.routes.ts'
];    


swaggerAutogen(options)(outputFile, endpointsFiles, doc);