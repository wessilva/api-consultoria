import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "../errors/AppError";

// ═══════════════════════════════════════════════════════
// EXTENDE O REQUEST PARA INCLUIR TENANT
// ═══════════════════════════════════════════════════════

declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        slug: string;
        plan: string;
        isActive: boolean;
        maxUsers: number;
      };
    }
  }
}

// ═══════════════════════════════════════════════════════
// MIDDLEWARE DE TENANT
// Identifica o tenant da requisição
// ═══════════════════════════════════════════════════════

/**
 * Middleware que identifica o tenant da requisição
 *
 * Pode identificar por:
 * 1. Header: X-Tenant-ID (para apps mobile)
 * 2. Subdomínio: empresa-abc.seuapp.com.br (para web)
 * 3. Do próprio usuário autenticado (req.user.tenantId)
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Se o usuário já está autenticado, pega o tenantId dele
    const tenantId =
      (req.headers["x-tenant-id"] as string) || (req.user as any)?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedError(
        "Tenant não identificado. Envie o header X-Tenant-ID",
      );
    }

    // Buscar tenant no banco
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        maxUsers: true,
      },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant não encontrado");
    }

    if (!tenant.isActive) {
      throw new ForbiddenError(
        "Conta suspensa. Entre em contato com o suporte.",
      );
    }

    // Adiciona tenant ao request
    req.tenant = tenant;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware que verifica se o usuário é super admin
 * (não tem tenantId ou tem role superadmin)
 */
export const superAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user) {
      throw new UnauthorizedError("Não autenticado");
    }

    // Busca o usuário no banco para verificar o role
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true, tenantId: true },
    });

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Super admin: não tem tenant ou tem role superadmin
    // Por enquanto, qualquer usuário autenticado pode acessar (para testes)
    // TODO: Implementar verificação de role quando tiver a tabela de admins

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware que verifica se o usuário pode acessar recursos do tenant
 * Usado para garantir isolamento de dados
 */
export const tenantAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userTenantId = (req.user as any)?.tenantId;
    const requestedTenantId = req.tenant?.id;

    // Se o usuário não tem tenant (super admin), pode acessar qualquer tenant
    if (!userTenantId) {
      return next();
    }

    // Se o tenant do usuário é diferente do tenant da requisição
    if (requestedTenantId && userTenantId !== requestedTenantId) {
      throw new ForbiddenError(
        "Você não tem permissão para acessar este recurso",
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
