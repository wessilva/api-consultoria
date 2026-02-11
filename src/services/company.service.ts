import { prisma } from "../lib/prisma";
import { AppError } from "../errors/AppError";

interface CreateCompanyDTO {
  name: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  userId: number;
  tenantId?: string;
}

interface UpdateCompanyDTO {
  name?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

export const companyService = {
  async list(userId: number) {
    return prisma.company.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  },

  async create(data: CreateCompanyDTO) {
    // Verificar se já existe uma empresa com esse nome para este usuário/tenant
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: data.name,
        userId: data.userId,
      },
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
        userId: data.userId,
        tenantId: data.tenantId,
      },
    });
  },

  async getById(id: number, userId: number) {
    const company = await prisma.company.findFirst({
      where: { id, userId },
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    return company;
  },

  async update(id: number, userId: number, data: UpdateCompanyDTO) {
    // Verificar se a empresa existe e pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id, userId },
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Se está mudando o nome, verificar se já existe outra empresa com esse nome
    if (data.name && data.name !== company.name) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          name: data.name,
          userId,
          NOT: { id },
        },
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

  async delete(id: number, userId: number, force: boolean = false) {
    // Verificar se a empresa existe e pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id, userId },
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Verificar quantos attendance cards estão vinculados
    const attendanceCardsCount = await prisma.attendanceCard.count({
      where: {
        company: company.name,
        userId,
      },
    });

    // Se existem cards e não é uma exclusão forçada, retornar erro especial
    if (attendanceCardsCount > 0 && !force) {
      const error = new AppError(
        `Esta empresa possui ${attendanceCardsCount} atendimento(s) vinculado(s). Deseja excluir a empresa e todos os atendimentos?`,
        409,
      );
      (error as any).attendanceCardsCount = attendanceCardsCount;
      throw error;
    }

    // Se force=true e existem cards, excluir os cards primeiro
    if (attendanceCardsCount > 0 && force) {
      await prisma.attendanceCard.deleteMany({
        where: {
          company: company.name,
          userId,
        },
      });
    }

    // Excluir a empresa
    await prisma.company.delete({
      where: { id },
    });
  },
};
