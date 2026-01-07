import { Router } from "express";
import { authMiddleware } from "./authMiddleware";
import { UserController } from "./controllers/user.controller";

const routes = Router();
const userController = new UserController();

// --- ROTAS PÚBLICAS ---
routes.post("/register", (req, res, next) =>
  userController.register(req, res, next)
);

routes.post("/login", (req, res, next) => userController.login(req, res, next));

// --- ROTAS PROTEGIDAS ---
routes.get("/users", authMiddleware, (req, res, next) =>
  userController.getAllUsers(req, res, next)
);

routes.get("/users/:id", authMiddleware, (req, res, next) =>
  userController.getUserById(req, res, next)
);

export default routes;
