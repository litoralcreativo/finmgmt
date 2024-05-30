import swaggerJSDoc, { Options, SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  info: {
    title: "API Documentation",
    version: "1.0.0",
  },
};

const options: Options = {
  swaggerDefinition,
  apis: ["./src/controllers/*.ts"], // Rutas de los archivos donde están definidas las rutas de tu API
};

export const swaggerSpec = swaggerJSDoc(options);
