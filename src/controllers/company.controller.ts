import { Request, Response } from "express";
import { companyService } from "../services/company.service";
import { AppError } from "../errors/AppError";

export const companyController = {
  // Listar todas as empresas
  async list(req: Request, res: Response) {
    const companies = await companyService.list();
    return res.json(companies);
  },

  // Criar nova empresa
  async create(req: Request, res: Response) {
    const { name, email, telefone, endereco } = req.body;

    if (!name) {
      throw new AppError("Nome da empresa é obrigatório", 400);
    }

    const company = await companyService.create({
      name,
      email,
      telefone,
      endereco,
    });

    return res.status(201).json(company);
  },

  // Buscar empresa por ID
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const company = await companyService.getById(parseInt(id));
    return res.json(company);
  },

  // Atualizar empresa
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, telefone, endereco } = req.body;

    const company = await companyService.update(parseInt(id), {
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

    await companyService.delete(parseInt(id), force);
    return res.status(204).send();
  },
};
