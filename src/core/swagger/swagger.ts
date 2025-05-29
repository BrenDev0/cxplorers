import swaggerAutogen from 'swagger-autogen';
const options = {
  openapi: "3.0.0" 
 
};

const doc = {
  info: {
    title: 'Project',
    description: 'Endpoints',
    version: '1.0.0',  
  },
  host: '',
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
    schemas: {}
  },
};

const outputFile = './swagger.json';  
const endpointsFiles = [
'routes'
  
];    


swaggerAutogen(options)(outputFile, endpointsFiles, doc);