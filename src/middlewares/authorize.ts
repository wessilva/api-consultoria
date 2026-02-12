import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";

// ═══════════════════════════════════════════════════════
// HIERARQUIA DE ROLES
// ═══════════════════════════════════════════════════════
//
// superadmin → Gestão global do SaaS (sem tenant)
// owner      → Dono/admin do tenant (gerencia users e companies)
// user       → Usuário comum (apenas seus attendance cards)
//
// ═══════════════════════════════════════════════════════

export type Role = "superadmin" | "owner" | "user";

const ROLE_HIERARCHY: Record<Role, number> = {
  user: 1,
  owner: 2,
  superadmin: 3,
};

/**
 * Verifica se o usuário tem uma das roles permitidas.
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.role) throw new UnauthorizedError("Não autenticado");

      if (!allowedRoles.includes(req.role as Role)) {
        throw new ForbiddenError(
          `Acesso negado. Requer: ${allowedRoles.join(" ou ")}. Sua role: ${req.role}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Verifica se o usuário tem permissão igual ou superior à role informada.
 */
export const authorizeMinRole = (minRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.role) throw new UnauthorizedError("Não autenticado");

      const userLevel = ROLE_HIERARCHY[req.role as Role] || 0;
      const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

      if (userLevel < requiredLevel) {
        throw new ForbiddenError(
          `Acesso negado. Nível mínimo: ${minRole}. Sua role: ${req.role}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Garante que o usuário pertence ao tenant da rota (:tenantId).
 * Superadmin pode acessar qualquer tenant.
 */
export const enforceTenantAccess = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.role) throw new UnauthorizedError("Não autenticado");
    if (req.role === "superadmin") return next();

    const routeTenantId = req.params.tenantId;
    if (routeTenantId && req.tenantId !== routeTenantId) {
      throw new ForbiddenError(
        "Sem permissão para acessar dados de outro tenant",
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Garante que o usuário tem um tenantId.
 * Usado nas rotas do app mobile.
 */
export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.tenantId) {
      if (req.role === "superadmin") {
        throw new ForbiddenError("Super admin deve usar rotas /admin");
      }
      throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
    }
    next();
  } catch (error) {
    next(error);
  }
};
