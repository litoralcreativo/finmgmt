import swaggerJSDoc, { Options, SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Fink API",
    version: "1.0.0",
    description: "This is a REST API application made with Express.",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html",
    },
    contact: {
      name: "Fink",
      url: "",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
};

const options: Options = {
  swaggerDefinition,
  apis: ["./src/controllers/*.routes.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
