import { Router, Request, Response, NextFunction } from "express";
import { TenantController } from "./controllers/tenant.controller";
import { OnboardingController } from "./controllers/onboarding.controller";
import { authMiddleware } from "./authMiddleware";
import { authorize } from "./middlewares/authorize";
import { UserService } from "./services/user.service";
import { tenantService } from "./services/tenant.service";
import { ForbiddenError, NotFoundError } from "./errors/AppError";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

const router = Router();
const tenantController = new TenantController();
const onboardingController = new OnboardingController();
const userService = new UserService();

// ═══════════════════════════════════════════════════════
// LOGIN DO ADMIN (Rota pública)
// ═══════════════════════════════════════════════════════
router.post(
  "/admin/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email e senha são obrigatórios." });
      }

      const result = await userService.authenticate(email, password);

      // Superadmin e owner podem acessar o painel admin
      if (!["superadmin", "owner"].includes(result.user.role)) {
        throw new ForbiddenError(
          "Acesso restrito. Apenas administradores podem acessar o painel.",
        );
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

// --- ONBOARDING ---
router.post("/onboarding/register", (req, res, next) =>
  onboardingController.register(req, res, next),
);

// ═══════════════════════════════════════════════════════
// ROTAS PROTEGIDAS — Apenas superadmin
// ═══════════════════════════════════════════════════════

router.get(
  "/admin/dashboard",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.getDashboard(req, res, next),
);

router.get(
  "/admin/tenants",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.list(req, res, next),
);

router.get(
  "/admin/tenants/:id",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.getById(req, res, next),
);

router.post(
  "/admin/tenants",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.create(req, res, next),
);

router.put(
  "/admin/tenants/:id",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.update(req, res, next),
);

router.patch(
  "/admin/tenants/:id/status",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.toggleStatus(req, res, next),
);

router.delete(
  "/admin/tenants/:id",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.delete(req, res, next),
);

router.get(
  "/admin/tenants/:id/usage",
  authMiddleware,
  authorize("superadmin"),
  (req, res, next) => tenantController.getUsageDetails(req, res, next),
);

// ═══════════════════════════════════════════════════════
// ROTAS DO OWNER — Vê apenas seu próprio tenant
// ═══════════════════════════════════════════════════════

// Dashboard do owner (métricas do seu tenant)
router.get(
  "/admin/owner/dashboard",
  authMiddleware,
  authorize("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId) {
        throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
      }

      const details = await tenantService.getUsageDetails(req.tenantId);
      res.json(details);
    } catch (error) {
      next(error);
    }
  },
);

// Owner visualiza dados do seu tenant
router.get(
  "/admin/owner/tenant",
  authMiddleware,
  authorize("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId) {
        throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
      }

      const tenant = await tenantService.getById(req.tenantId);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  },
);

// ═══════════════════════════════════════════════════════
// OWNER — Gestão de Usuários do Tenant
// ═══════════════════════════════════════════════════════

// Listar usuários do tenant
router.get(
  "/admin/owner/users",
  authMiddleware,
  authorize("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId) {
        throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
      }

      const users = await prisma.user.findMany({
        where: { tenantId: req.tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
  },
);

// Criar usuário no tenant
router.post(
  "/admin/owner/users",
  authMiddleware,
  authorize("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId) {
        throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
      }

      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Nome, email e senha são obrigatórios." });
      }

      // Verificar limite de usuários
      const canAdd = await tenantService.canAddUser(req.tenantId);
      if (!canAdd) {
        return res
          .status(403)
          .json({ error: "Limite de usuários do plano atingido." });
      }

      // Verificar se email já existe no tenant
      const existing = await prisma.user.findFirst({
        where: { tenantId: req.tenantId, email },
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: "Email já cadastrado neste tenant." });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "user",
          tenantId: req.tenantId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
);

// Atualizar usuário do tenant
router.put(
  "/admin/owner/users/:id",
  authMiddleware,
  authorize("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId) {
        throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
      }

      const userId = parseInt(req.params.id);
      const { name, email, password, isActive } = req.body;

      // Verificar se o user pertence ao tenant
      const existingUser = await prisma.user.findFirst({
        where: { id: userId, tenantId: req.tenantId },
      });

      if (!existingUser) {
        throw new NotFoundError("Usuário não encontrado neste tenant");
      }

      // Não permitir editar outro owner
      if (existingUser.role === "owner" && existingUser.id !== req.userId) {
        throw new ForbiddenError("Não é possível editar outro proprietário");
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (typeof isActive === "boolean") updateData.isActive = isActive;
      if (password) updateData.passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

// Ativar/Desativar usuário do tenant
router.patch(
  "/admin/owner/users/:id/status",
  authMiddleware,
  authorize("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId) {
        throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
      }

      const userId = parseInt(req.params.id);

      const existingUser = await prisma.user.findFirst({
        where: { id: userId, tenantId: req.tenantId },
      });

      if (!existingUser) {
        throw new NotFoundError("Usuário não encontrado neste tenant");
      }

      // Não permitir desativar a si mesmo (owner)
      if (existingUser.id === req.userId) {
        throw new ForbiddenError("Não é possível desativar sua própria conta");
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !existingUser.isActive },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

// Deletar usuário do tenant
router.delete(
  "/admin/owner/users/:id",
  authMiddleware,
  authorize("owner"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId) {
        throw new ForbiddenError("Usuário não vinculado a nenhum tenant");
      }

      const userId = parseInt(req.params.id);

      const existingUser = await prisma.user.findFirst({
        where: { id: userId, tenantId: req.tenantId },
      });

      if (!existingUser) {
        throw new NotFoundError("Usuário não encontrado neste tenant");
      }

      // Não permitir deletar a si mesmo
      if (existingUser.id === req.userId) {
        throw new ForbiddenError("Não é possível deletar sua própria conta");
      }

      // Não permitir deletar outro owner
      if (existingUser.role === "owner") {
        throw new ForbiddenError("Não é possível deletar um proprietário");
      }

      await prisma.user.delete({ where: { id: userId } });

      res.json({ message: "Usuário removido com sucesso" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
