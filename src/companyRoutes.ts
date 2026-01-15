import { Router } from "express";
import { companyController } from "./controllers/company.controller";
import { authMiddleware } from "./authMiddleware";

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas de empresas
router.get("/companies", companyController.list);
router.post("/companies", companyController.create);
router.get("/companies/:id", companyController.getById);
router.put("/companies/:id", companyController.update);
router.delete("/companies/:id", companyController.delete);

export default router;
