import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env"; // ✅ Usa variáveis validadas

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
        url: `http://localhost:${env.PORT}`,
        description: "Servidor de desenvolvimento",
      },
      ...(env.NODE_ENV === "production"
        ? [
            {
              url: "https://api-consultoria-production.up.railway.app",
              description: "Servidor de produção",
            },
          ]
        : []),
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
  console.log(`📚 Swagger: http://localhost:${env.PORT}/api-docs`);
};
