import { Router } from "express";
import { companyController } from "./controllers/company.controller";
import { authMiddleware } from "./authMiddleware";
import { authorize } from "./middlewares/authorize";

const router = Router();

router.use(authMiddleware);

// Listar — owner e user podem ver (user precisa ver para selecionar no card)
router.get("/companies", (req, res, next) => companyController.list(req, res ));

// Buscar por ID — owner e user
router.get("/companies/:id", (req, res, next) => companyController.getById(req, res ));

// Criar — APENAS owner
router.post("/companies", authorize("owner"), (req, res, next) => companyController.create(req, res ));

// Atualizar — APENAS owner
router.put("/companies/:id", authorize("owner"), (req, res, next) => companyController.update(req, res ));

// Deletar — APENAS owner
router.delete("/companies/:id", authorize("owner"), (req, res, next) => companyController.delete(req, res ));

export default router;