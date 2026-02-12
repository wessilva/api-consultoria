import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "./authMiddleware";
import { authorize } from "./middlewares/authorize";
import { ownerTenantService } from "./services/ownerTenant.service";
import { ForbiddenError } from "./errors/AppError";

// ═══════════════════════════════════════════════════════
// ROTAS DO OWNER — Gerencia seu próprio tenant
// ═══════════════════════════════════════════════════════

const router = Router();

// Auth + role owner em todas as rotas
router.use(authMiddleware);
router.use(authorize("owner"));

// Garante que só acessa dados do próprio tenant
router.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.tenantId) {
    return next(new ForbiddenError("Usuário não vinculado a nenhum tenant"));
  }
  next();
});

// --- DASHBOARD DO TENANT ---
router.get(
  "/dashboard",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await ownerTenantService.getDashboard(req.tenantId!);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
);

// --- GESTÃO DE USUÁRIOS ---

router.get(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await ownerTenantService.listUsers(req.tenantId!);
      res.json(users);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await ownerTenantService.createUser(req.tenantId!, req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/users/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await ownerTenantService.updateUser(
        req.tenantId!,
        userId,
        req.body,
      );
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/users/:userId/deactivate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await ownerTenantService.deactivateUser(
        req.tenantId!,
        userId,
      );
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
