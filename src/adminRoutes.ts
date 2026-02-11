import { Router } from "express";
import { TenantController } from "./controllers/tenant.controller";
import { OnboardingController } from "./controllers/onboarding.controller";
import { authMiddleware } from "./authMiddleware";

// ═══════════════════════════════════════════════════════
// ROTAS DE ADMIN (Super Admin) E ONBOARDING
// ═══════════════════════════════════════════════════════

const router = Router();
const tenantController = new TenantController();
const onboardingController = new OnboardingController();

// --- ONBOARDING (Rota pública para cadastro de novas empresas) ---
router.post("/onboarding/register", (req, res, next) =>
  onboardingController.register(req, res, next),
);

// Todas as rotas de admin requerem autenticação
// TODO: Adicionar middlewa re de verificação de super admin

// --- DASHBOARD ---
router.get("/admin/dashboard", authMiddleware, (req, res, next) =>
  tenantController.getDashboard(req, res, next),
);

// --- TENANTS ---
router.get("/admin/tenants", authMiddleware, (req, res, next) =>
  tenantController.list(req, res, next),
);

router.get("/admin/tenants/:id", authMiddleware, (req, res, next) =>
  tenantController.getById(req, res, next),
);

router.post("/admin/tenants", authMiddleware, (req, res, next) =>
  tenantController.create(req, res, next),
);

router.put("/admin/tenants/:id", authMiddleware, (req, res, next) =>
  tenantController.update(req, res, next),
);

router.patch("/admin/tenants/:id/status", authMiddleware, (req, res, next) =>
  tenantController.toggleStatus(req, res, next),
);

router.delete("/admin/tenants/:id", authMiddleware, (req, res, next) =>
  tenantController.delete(req, res, next),
);

router.get("/admin/tenants/:id/usage", authMiddleware, (req, res, next) =>
  tenantController.getUsageDetails(req, res, next),
);

export default router;
