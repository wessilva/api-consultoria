import { Router } from "express";
import { companyController } from "./controllers/company.controller";
import { authMiddleware } from "./authMiddleware";

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da empresa
 *         name:
 *           type: string
 *           description: Nome da empresa (único)
 *         email:
 *           type: string
 *           description: E-mail da empresa
 *         telefone:
 *           type: string
 *           description: Telefone da empresa
 *         endereco:
 *           type: string
 *           description: Endereço da empresa
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       example:
 *         id: 1
 *         name: "Empresa ABC"
 *         email: "contato@empresaabc.com"
 *         telefone: "(11) 99999-9999"
 *         endereco: "Rua das Flores, 123"
 *         createdAt: "2026-01-15T10:00:00.000Z"
 *         updatedAt: "2026-01-15T10:00:00.000Z"
 *
 *     CreateCompanyInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da empresa (obrigatório e único)
 *         email:
 *           type: string
 *           description: E-mail da empresa
 *         telefone:
 *           type: string
 *           description: Telefone da empresa
 *         endereco:
 *           type: string
 *           description: Endereço da empresa
 *       example:
 *         name: "Nova Empresa"
 *         email: "contato@novaempresa.com"
 *         telefone: "(11) 88888-8888"
 *         endereco: "Av. Principal, 456"
 *
 *     UpdateCompanyInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da empresa
 *         email:
 *           type: string
 *           description: E-mail da empresa
 *         telefone:
 *           type: string
 *           description: Telefone da empresa
 *         endereco:
 *           type: string
 *           description: Endereço da empresa
 *       example:
 *         name: "Empresa Atualizada"
 *         email: "novo@email.com"
 */

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Gerenciamento de empresas
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Lista todas as empresas
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 */
router.get("/companies", companyController.list);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Cria uma nova empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanyInput'
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Dados inválidos ou empresa já existe
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 */
router.post("/companies", companyController.create);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Busca uma empresa pelo ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 *       404:
 *         description: Empresa não encontrada
 */
router.get("/companies/:id", companyController.getById);

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Atualiza uma empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyInput'
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Dados inválidos ou nome já existe
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 *       404:
 *         description: Empresa não encontrada
 */
router.put("/companies/:id", companyController.update);

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Remove uma empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *         description: Se true, exclui a empresa e todos os atendimentos vinculados
 *     responses:
 *       204:
 *         description: Empresa removida com sucesso
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 *       404:
 *         description: Empresa não encontrada
 *       409:
 *         description: Empresa possui atendimentos vinculados (use force=true para forçar exclusão)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Esta empresa possui 5 atendimento(s) vinculado(s). Deseja excluir a empresa e todos os atendimentos?"
 *                 attendanceCardsCount:
 *                   type: integer
 *                   example: 5
 */
router.delete("/companies/:id", companyController.delete);

export default router;
