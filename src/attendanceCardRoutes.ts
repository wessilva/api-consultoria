import { Router } from "express";
import { authMiddleware } from "./authMiddleware";
import { validate } from "./middlewares/validate";
import {
  createAttendanceCardSchema,
  updateAttendanceCardSchema,
} from "./validators/attendanceCard.validator";
import { AttendanceCardController } from "./controllers/attendanceCard.controller";

const routes = Router();
const attendanceCardController = new AttendanceCardController();

// Criar um novo card de atendimento
routes.post(
  "/attendance-cards",
  authMiddleware,
  validate(createAttendanceCardSchema),
  (req, res, next) => attendanceCardController.create(req, res, next)
);

// Listar todos os cards de atendimento do usuário logado
routes.get("/attendance-cards", authMiddleware, (req, res, next) =>
  attendanceCardController.findAll(req, res, next)
);

// Buscar um card de atendimento específico
routes.get("/attendance-cards/:id", authMiddleware, (req, res, next) =>
  attendanceCardController.findById(req, res, next)
);

// Atualizar um card de atendimento
routes.put(
  "/attendance-cards/:id",
  authMiddleware,
  validate(updateAttendanceCardSchema),
  (req, res, next) => attendanceCardController.update(req, res, next)
);

// Deletar um card de atendimento
routes.delete("/attendance-cards/:id", authMiddleware, (req, res, next) =>
  attendanceCardController.delete(req, res, next)
);

export default routes;
