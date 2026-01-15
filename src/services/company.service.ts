import { prisma } from "../lib/prisma";
import { AppError } from "../errors/AppError";

interface CreateCompanyData {
  name: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

interface UpdateCompanyData {
  name?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

export const companyService = {
  async list() {
    return prisma.company.findMany({
      orderBy: { name: "asc" },
    });
  },

  async create(data: CreateCompanyData) {
    // Verificar se já existe uma empresa com esse nome
    const existingCompany = await prisma.company.findUnique({
      where: { name: data.name },
    });

    if (existingCompany) {
      throw new AppError("Já existe uma empresa com este nome", 400);
    }

    return prisma.company.create({
      data: {
        name: data.name,
        email: data.email,
        telefone: data.telefone,
        endereco: data.endereco,
      },
    });
  },

  async getById(id: number) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    return company;
  },

  async update(id: number, data: UpdateCompanyData) {
    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Se está mudando o nome, verificar se já existe outra empresa com esse nome
    if (data.name && data.name !== company.name) {
      const existingCompany = await prisma.company.findUnique({
        where: { name: data.name },
      });

      if (existingCompany) {
        throw new AppError("Já existe uma empresa com este nome", 400);
      }
    }

    return prisma.company.update({
      where: { id },
      data,
    });
  },

  async delete(id: number, force: boolean = false) {
    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Verificar quantos attendance cards estão vinculados
    const attendanceCardsCount = await prisma.attendanceCard.count({
      where: {
        company: company.name,
      },
    });

    // Se existem cards e não é uma exclusão forçada, retornar erro especial
    if (attendanceCardsCount > 0 && !force) {
      const error = new AppError(
        `Esta empresa possui ${attendanceCardsCount} atendimento(s) vinculado(s). Deseja excluir a empresa e todos os atendimentos?`,
        409
      );
      (error as any).attendanceCardsCount = attendanceCardsCount;
      throw error;
    }

    // Se force=true e existem cards, excluir os cards primeiro
    if (attendanceCardsCount > 0 && force) {
      await prisma.attendanceCard.deleteMany({
        where: {
          company: company.name,
        },
      });
    }

    // Excluir a empresa
    await prisma.company.delete({
      where: { id },
    });
  },
};
