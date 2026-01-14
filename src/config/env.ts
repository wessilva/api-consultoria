// ═══════════════════════════════════════════════════════
// CARREGA AS VARIÁVEIS DE AMBIENTE DO ARQUIVO .env
// ═══════════════════════════════════════════════════════
import "dotenv/config"; // ✅ Carrega o .env ANTES de tudo
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),

  // Opção escolhida: validação específica para PostgreSQL
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL é obrigatória")
    .refine(
      (val) => val.startsWith("postgresql://") || val.startsWith("postgres://"),
      { message: "DATABASE_URL deve ser uma URL PostgreSQL válida" }
    ),

  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter no mínimo 32 caracteres"),

  JWT_EXPIRES_IN: z.string().default("7d"),
});

// Valida as variáveis de ambiente
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Erro nas variáveis de ambiente:");
  console.error(_env.error.format());
  throw new Error("Configuração de ambiente inválida");
}

export const env = _env.data;

// Logs para debug (não mostra informações sensíveis completas)
console.log("✅ Configurações carregadas:");
console.log(`   NODE_ENV: ${env.NODE_ENV}`);
console.log(`   PORT: ${env.PORT}`);
console.log(`   JWT_SECRET: ${env.JWT_SECRET.substring(0, 10)}...`);
console.log(
  `   DATABASE_URL: ${env.DATABASE_URL.split("@")[1] || "configurado"}`
);
