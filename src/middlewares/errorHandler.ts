import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, ValidationError } from "../errors/AppError";
import { env } from "../config/env";

// ═══════════════════════════════════════════════════════
// MIDDLEWARE DE TRATAMENTO DE ERROS
// Este middleware captura TODOS os erros da aplicação
// e transforma em respostas HTTP padronizadas
// ═══════════════════════════════════════════════════════

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 🔍 Log do erro para debug (em produção, usar logger como Pino/Winston)
  console.error("❌ Erro capturado:", {
    name: error.name,
    message: error.message,
    stack: env.NODE_ENV === "development" ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // ─────────────────────────────────────────────────────
  // 1. ERROS CUSTOMIZADOS (AppError e subclasses)
  // ─────────────────────────────────────────────────────
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // ─────────────────────────────────────────────────────
  // 2. ERROS DE VALIDAÇÃO DO ZOD
  // ─────────────────────────────────────────────────────
  if (error instanceof ZodError) {
    // 🔍 Zod retorna um array de erros detalhados
    // Exemplo: [{ path: ['email'], message: 'Invalid email' }]
    const validationError = new ValidationError("Erro de validação", {
      issues: error.issues.map((err) => ({
        field: err.path.join("."), // 'user.email' ou apenas 'email'
        message: err.message, // Mensagem de erro do Zod
      })),
    });
    return res.status(400).json(validationError.toJSON());
  }

  // ─────────────────────────────────────────────────────
  // 3. ERROS DO PRISMA (Banco de Dados)
  // ─────────────────────────────────────────────────────

  // 3.1 - Erros conhecidos do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation (Email já cadastrado, etc)
    if (error.code === "P2002") {
      const field = (error.meta?.target as string[])?.join(", ") || "campo";
      return res.status(409).json({
        error: `${field} já está em uso`,
        code: "CONFLICT",
        statusCode: 409,
      });
    }

    // P2025: Record not found (Registro não encontrado)
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Recurso não encontrado",
        code: "NOT_FOUND",
        statusCode: 404,
      });
    }

    // P2003: Foreign key constraint violation (Referência inválida)
    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Referência inválida",
        code: "INVALID_REFERENCE",
        statusCode: 400,
      });
    }

    // P2014: Relation violation (Tentou deletar com relações)
    if (error.code === "P2014") {
      return res.status(400).json({
        error: "Não é possível deletar. Existem registros relacionados",
        code: "RELATION_VIOLATION",
        statusCode: 400,
      });
    }
  }

  // 3.2 - Erros de validação do Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: "Dados inválidos para o banco de dados",
      code: "VALIDATION_ERROR",
      statusCode: 400,
    });
  }

  // ─────────────────────────────────────────────────────
  // 4. ERROS DE AUTENTICAÇÃO JWT
  // ─────────────────────────────────────────────────────

  // Token malformado ou assinatura inválida
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Token inválido",
      code: "INVALID_TOKEN",
      statusCode: 401,
    });
  }

  // Token expirado
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expirado. Faça login novamente",
      code: "EXPIRED_TOKEN",
      statusCode: 401,
    });
  }

  // ─────────────────────────────────────────────────────
  // 5. ERROS NÃO TRATADOS (500 Internal Server Error)
  // ─────────────────────────────────────────────────────
  // Se chegou aqui, é um erro que não esperávamos
  // Em produção, não mostramos detalhes por segurança
  return res.status(500).json({
    error:
      env.NODE_ENV === "development"
        ? error.message
        : "Erro interno do servidor",
    code: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
    ...(env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

// ═══════════════════════════════════════════════════════
// MIDDLEWARE PARA ROTAS NÃO ENCONTRADAS (404)
// Deve ser adicionado ANTES do errorHandler no server.ts
// ═══════════════════════════════════════════════════════
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Rota ${req.method} ${req.path} não encontrada`,
    code: "NOT_FOUND",
    statusCode: 404,
  });
};
