import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../errors/AppError";

// ═══════════════════════════════════════════════════════
// SERVIÇO DO OWNER — Gerencia seu próprio tenant
// ═══════════════════════════════════════════════════════

export const ownerTenantService = {
  /**
   * Dashboard do tenant do owner
   */
  async getDashboard(tenantId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      tenant,
      totalUsers,
      activeUsers,
      totalCompanies,
      totalCards,
      cardsThisMonth,
    ] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          maxUsers: true,
          isActive: true,
        },
      }),
      prisma.user.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, isActive: true } }),
      prisma.company.count({ where: { tenantId } }),
      prisma.attendanceCard.count({ where: { tenantId } }),
      prisma.attendanceCard.count({
        where: { tenantId, createdAt: { gte: startOfMonth } },
      }),
    ]);

    if (!tenant) throw new NotFoundError("Tenant não encontrado");

    return {
      tenant,
      metrics: {
        totalUsers,
        activeUsers,
        totalCompanies,
        totalCards,
        cardsThisMonth,
        usersLimit: tenant.maxUsers,
        usersRemaining: tenant.maxUsers - activeUsers,
      },
    };
  },

  /**
   * Lista usuários do tenant
   */
  async listUsers(tenantId: string) {
    return prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { attendanceCards: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Cria um novo usuário (role "user") dentro do tenant
   */
  async createUser(
    tenantId: string,
    data: { name: string; email: string; password: string },
  ) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundError("Tenant não encontrado");

    const currentUsers = await prisma.user.count({
      where: { tenantId, isActive: true },
    });

    if (currentUsers >= tenant.maxUsers) {
      throw new ForbiddenError(
        `Limite de ${tenant.maxUsers} usuários atingido. Faça upgrade do plano.`,
      );
    }

    const existing = await prisma.user.findFirst({
      where: { tenantId, email: data.email },
    });
    if (existing) throw new ConflictError("Email já cadastrado neste tenant");

    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "user", // Owner só cria users comuns
        tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  /**
   * Atualiza um usuário do tenant (apenas users, não outros owners)
   */
  async updateUser(
    tenantId: string,
    userId: number,
    data: { name?: string; email?: string; isActive?: boolean },
  ) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) throw new NotFoundError("Usuário não encontrado neste tenant");
    if (user.role === "owner")
      throw new ForbiddenError("Não é possível alterar outro owner");

    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        isActive: data.isActive,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  },

  /**
   * Desativa um usuário do tenant
   */
  async deactivateUser(tenantId: string, userId: number) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) throw new NotFoundError("Usuário não encontrado neste tenant");
    if (user.role === "owner")
      throw new ForbiddenError("Não é possível desativar o owner");

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  },
};
