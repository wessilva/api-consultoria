import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Consultoria",
      version: "1.0.0",
      description: "Documentação da API de Consultoria",
      contact: {
        name: "Suporte",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3333}`,
        description: "Servidor de desenvolvimento",
        
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/**/*.ts"], // Arquivos que contêm anotações Swagger
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(
    `Swagger disponível em http://localhost:${
      process.env.PORT || 3333
    }/api-docs`
  );
};
