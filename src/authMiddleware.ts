// ═══════════════════════════════════════════════════════
// MIDDLEWARE DE AUTENTICAÇÃO JWT
// Verifica se o usuário está autenticado (tem token válido)
// ═══════════════════════════════════════════════════════

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, NotFoundError } from "./errors/AppError";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

// ═══════════════════════════════════════════════════════
// TIPAGEM: Extende o Request do Express
// Adiciona a propriedade 'user' no objeto req
// ═══════════════════════════════════════════════════════
declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string; // ID como string (compatível com JWT)
        userId: number; // ID como number (para queries do Prisma)
      };
      userId: number;
      tenantId: string | null;
      role: string;
    }
  }
}

// ═══════════════════════════════════════════════════════
// INTERFACE DO PAYLOAD DO JWT
// ═══════════════════════════════════════════════════════
interface JWTPayload {
  id: string;
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration (timestamp)
}

// ═══════════════════════════════════════════════════════
// MIDDLEWARE DE AUTENTICAÇÃO
// ═══════════════════════════════════════════════════════
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { authorization } = req.headers;

    // 1. Verificar se o header Authorization foi enviado
    if (!authorization) {
      throw new UnauthorizedError("Token não fornecido");
    }

    // 2. Validar formato do header (deve ser "Bearer TOKEN")
    const parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new UnauthorizedError("Token mal formatado. Use: Bearer [token]");
    }

    const token = parts[1];

    // 3. Verificar e decodificar o token JWT
    // Se o token for inválido ou expirado, jwt.verify lança erro
    // O errorHandler vai capturar JsonWebTokenError ou TokenExpiredError
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // 4. Verificar se o usuário ainda existe no banco
    // (usuário pode ter sido deletado após criar o token)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      select: { id: true, email: true, name: true, tenantId: true, role: true },
    });

    if (!user) {
      throw new NotFoundError("Usuário do token não encontrado");
    }

    // 5. Adicionar informações do usuário ao objeto req
    // Agora qualquer rota autenticada pode acessar req.user
    req.user = {
      id: user.id.toString(),
      userId: user.id,
    };

    // Adiciona userId, tenantId e role diretamente no request para facilitar acesso
    req.userId = user.id;
    req.tenantId = user.tenantId;
    req.role = user.role;

    // 6. Passar para o próximo middleware/controller
    return next();
  } catch (error) {
    // Se for erro customizado (UnauthorizedError, NotFoundError),
    // o errorHandler vai tratar automaticamente
    // Se for erro do JWT, também será tratado pelo errorHandler
    next(error);
  }
};
