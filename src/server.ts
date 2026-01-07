import express from "express";
import cors from "cors";
import { setupSwagger } from "./swagger";

// Importa as rotas de usuário que acabamos de criar
import userRoutes from "./userRoutes";
import attendanceCardRoutes from "./attendanceCardRoutes";
import { errorHandler } from "./middlewares/errorHandler";

// Inicializa o Express (nosso servidor)
const app = express();

// --- Middlewares Essenciais ---

// 1. Habilita o CORS (para o React Native poder acessar)
app.use(cors());

// 2. Habilita o Express para entender JSON no corpo das requisições
app.use(express.json());

// 3. Configura o Swagger para documentação da API
setupSwagger(app);


// --- Rotas da Aplicação ---
app.use(userRoutes);
app.use(attendanceCardRoutes);

// --- Middleware de Erro Global (deve ser o último) ---
app.use(errorHandler);

// --- Iniciar o Servidor ---
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});
