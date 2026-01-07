import "dotenv/config"; // carrega variáveis do .env quando este arquivo é importado
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
     url: env("DATABASE_URL"),
  }
  
});
