// src/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("⚠️ JWT_SECRET não configurado no .env");
}

// Vamos adicionar o usuário ao Request do Express
declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
        userId: number;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  // Formato: "Bearer SEU_TOKEN_AQUI"
  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Verifique se o usuário ainda existe (opcional, mas bom)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Usuário do token não encontrado." });
    }

    // Adicione o ID do usuário à requisição
    req.user = { id: user.id.toString(), userId: user.id };

    return next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
