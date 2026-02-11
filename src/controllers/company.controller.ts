import { Request, Response } from "express";
import { companyService } from "../services/company.service";
import { AppError } from "../errors/AppError";

export const companyController = {
  // Listar todas as empresas do usuário
  async list(req: Request, res: Response) {
    const userId = (req as any).userId;
    const companies = await companyService.list(userId);
    return res.json(companies);
  },

  // Criar nova empresa
  async create(req: Request, res: Response) {
    const { name, email, telefone, endereco } = req.body;
    const userId = (req as any).userId;
    const tenantId = (req as any).tenantId;

    if (!name) {
      throw new AppError("Nome da empresa é obrigatório", 400);
    }

    const company = await companyService.create({
      name,
      email,
      telefone,
      endereco,
      userId,
      tenantId,
    });

    return res.status(201).json(company);
  },

  // Buscar empresa por ID
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const userId = (req as any).userId;

    const company = await companyService.getById(parseInt(id), userId);
    return res.json(company);
  },

  // Atualizar empresa
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, telefone, endereco } = req.body;
    const userId = (req as any).userId;

    const company = await companyService.update(parseInt(id), userId, {
      name,
      email,
      telefone,
      endereco,
    });

    return res.json(company);
  },

  // Deletar empresa
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const force = req.query.force === "true";
    const userId = (req as any).userId;

    await companyService.delete(parseInt(id), userId, force);
    return res.status(204).send();
  },
};
