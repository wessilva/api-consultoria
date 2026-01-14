import express from "express";
import cors from "cors";
import { setupSwagger } from "./swagger";
import { env } from "./config/env"; // ✅ Importa variáveis validadas

// Importa as rotas
import userRoutes from "./userRoutes";
import attendanceCardRoutes from "./attendanceCardRoutes";

// Importa os middlewares de erro
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

// ═══════════════════════════════════════════════════════
// INICIALIZAÇÃO DO EXPRESS
// ═══════════════════════════════════════════════════════
const app = express();

// ═══════════════════════════════════════════════════════
// MIDDLEWARES ESSENCIAIS
// ═══════════════════════════════════════════════════════

// 1. Habilita o CORS (permite React Native acessar a API)
app.use(cors());

// 2. Parser de JSON (lê o body das requisições com UTF-8)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Logger de requisições (apenas em desenvolvimento)
if (env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`\n📥 ${req.method} ${req.path}`);
    console.log(`📦 Body:`, req.body);
    next();
  });
}

// 4. Configura o Swagger (documentação interativa da API)
setupSwagger(app);

// ═══════════════════════════════════════════════════════
// HEALTH CHECK - Para verificar se a API está rodando
// ═══════════════════════════════════════════════════════
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(), // Tempo em segundos desde que o servidor iniciou
  });
});

// ═══════════════════════════════════════════════════════
// ROTAS DA APLICAÇÃO
// ═══════════════════════════════════════════════════════
app.use(userRoutes);
app.use(attendanceCardRoutes);

// ═══════════════════════════════════════════════════════
// MIDDLEWARES DE ERRO (devem ser os últimos!)
// ═══════════════════════════════════════════════════════

// 1. Handler para rotas não encontradas (404)
app.use(notFoundHandler);

// 2. Handler global de erros (500, 400, 401, etc)
app.use(errorHandler);

// ═══════════════════════════════════════════════════════
// INICIAR O SERVIDOR
// ═══════════════════════════════════════════════════════
app.listen(env.PORT, () => {
  console.log("═════════════════════════════════════════════");
  console.log("🚀 Servidor iniciado com sucesso!");
  console.log("═════════════════════════════════════════════");
  console.log(`🔥 Ambiente: ${env.NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${env.PORT}`);
  console.log(`📚 Swagger: http://localhost:${env.PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${env.PORT}/health`);
  console.log("═════════════════════════════════════════════");
});
