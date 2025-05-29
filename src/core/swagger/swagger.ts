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
  host: 'https://cxplorers-app.up.railway.app',
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
      }
    }
  },
};

const outputFile = './swagger.json';  
const endpointsFiles = [
  // users //
  '../../modules/users/users.routes.ts'
  
];    


swaggerAutogen(options)(outputFile, endpointsFiles, doc);