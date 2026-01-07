import { Request, Response, NextFunction } from "express";
import { AttendanceCardService } from "../services/attendanceCard.service";
import { AppError } from "../middlewares/errorHandler";

const attendanceCardService = new AttendanceCardService();

/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceCard:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         totalHours:
 *           type: number
 *         userId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export class AttendanceCardController {
  /**
   * @swagger
   * /attendance-cards:
   *   post:
   *     summary: Criar um novo card de atendimento
   *     tags: [Cards de Atendimento]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *             properties:
   *               title:
   *                 type: string
   *                 example: Atendimento Cliente X
   *               description:
   *                 type: string
   *                 example: Configuração de servidor
   *               status:
   *                 type: string
   *                 enum: [pending, in_progress, completed]
   *                 example: pending
   *               totalHours:
   *                 type: number
   *                 example: 0
   *     responses:
   *       201:
   *         description: Card criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AttendanceCard'
   *       401:
   *         description: Não autorizado
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const card = await attendanceCardService.create(userId, req.body);
      return res.status(201).json(card);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /attendance-cards:
   *   get:
   *     summary: Listar todos os cards de atendimento do usuário logado
   *     tags: [Cards de Atendimento]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de cards retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/AttendanceCard'
   *       401:
   *         description: Não autorizado
   */
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const cards = await attendanceCardService.findAllByUser(userId);
      return res.json(cards);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /attendance-cards/{id}:
   *   get:
   *     summary: Buscar um card de atendimento específico
   *     tags: [Cards de Atendimento]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do card de atendimento
   *     responses:
   *       200:
   *         description: Card encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AttendanceCard'
   *       404:
   *         description: Card não encontrado
   *       403:
   *         description: Acesso negado
   *       401:
   *         description: Não autorizado
   */
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseInt(req.params.id);
      const userId = req.user.userId;

      if (isNaN(cardId)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const card = await attendanceCardService.findById(cardId, userId);
      return res.json(card);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Card de atendimento não encontrado") {
          return next(new AppError(error.message, 404));
        }
        if (error.message === "Acesso negado") {
          return next(new AppError(error.message, 403));
        }
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /attendance-cards/{id}:
   *   put:
   *     summary: Atualizar um card de atendimento
   *     tags: [Cards de Atendimento]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do card de atendimento
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [pending, in_progress, completed]
   *               totalHours:
   *                 type: number
   *     responses:
   *       200:
   *         description: Card atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AttendanceCard'
   *       404:
   *         description: Card não encontrado
   *       403:
   *         description: Acesso negado
   *       401:
   *         description: Não autorizado
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseInt(req.params.id);
      const userId = req.user.userId;

      if (isNaN(cardId)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const card = await attendanceCardService.update(cardId, userId, req.body);
      return res.json(card);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Card de atendimento não encontrado") {
          return next(new AppError(error.message, 404));
        }
        if (error.message === "Acesso negado") {
          return next(new AppError(error.message, 403));
        }
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /attendance-cards/{id}:
   *   delete:
   *     summary: Deletar um card de atendimento
   *     tags: [Cards de Atendimento]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do card de atendimento
   *     responses:
   *       204:
   *         description: Card deletado com sucesso
   *       404:
   *         description: Card não encontrado
   *       403:
   *         description: Acesso negado
   *       401:
   *         description: Não autorizado
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const cardId = parseInt(req.params.id);
      const userId = req.user.userId;

      if (isNaN(cardId)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      await attendanceCardService.delete(cardId, userId);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Card de atendimento não encontrado") {
          return next(new AppError(error.message, 404));
        }
        if (error.message === "Acesso negado") {
          return next(new AppError(error.message, 403));
        }
      }
      next(error);
    }
  }
}
