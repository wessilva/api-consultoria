import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../errors/AppError";

// ═══════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════

export interface CreateTenantDTO {
  name: string;
  slug?: string;
  plan?: string;
  maxUsers?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface UpdateTenantDTO {
  name?: string;
  plan?: string;
  isActive?: boolean;
  maxUsers?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

// ═══════════════════════════════════════════════════════
// SERVIÇO DE TENANT
// ═══════════════════════════════════════════════════════

export const tenantService = {
  /**
   * Gera um slug a partir do nome
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]+/g, "-") // Substitui caracteres especiais por hífen
      .replace(/(^-|-$)/g, ""); // Remove hífens do início e fim
  },

  /**
   * Lista todos os tenants (para super admin)
   */
  async list(filters?: { plan?: string; isActive?: boolean }) {
    const where: any = {};

    if (filters?.plan) {
      where.plan = filters.plan;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            companies: true,
            attendanceCards: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Busca um tenant pelo ID
   */
  async getById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            companies: true,
            attendanceCards: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant não encontrado");
    }

    return tenant;
  },

  /**
   * Busca um tenant pelo slug
   */
  async getBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant não encontrado");
    }

    return tenant;
  },

  /**
   * Cria um novo tenant
   */
  async create(data: CreateTenantDTO) {
    // Gera slug se não foi fornecido
    const slug = data.slug || this.generateSlug(data.name);

    // Verifica se slug já existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictError("Já existe um tenant com este nome/slug");
    }

    return prisma.tenant.create({
      data: {
        name: data.name,
        slug,
        plan: data.plan || "basic",
        maxUsers: data.maxUsers || 5,
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone,
      },
    });
  },

  /**
   * Atualiza um tenant
   */
  async update(id: string, data: UpdateTenantDTO) {
    // Verifica se existe
    await this.getById(id);

    return prisma.tenant.update({
      where: { id },
      data,
    });
  },

  /**
   * Ativa ou desativa um tenant
   */
  async toggleStatus(id: string, isActive: boolean) {
    // Verifica se existe
    await this.getById(id);

    return prisma.tenant.update({
      where: { id },
      data: { isActive },
    });
  },

  /**
   * Deleta um tenant (cuidado!)
   */
  async delete(id: string) {
    // Verifica se existe
    const tenant = await this.getById(id);

    // Verifica se tem usuários
    const usersCount = await prisma.user.count({
      where: { tenantId: id },
    });

    if (usersCount > 0) {
      throw new ForbiddenError(
        `Não é possível deletar. Este tenant possui ${usersCount} usuário(s) vinculado(s).`,
      );
    }

    return prisma.tenant.delete({
      where: { id },
    });
  },

  /**
   * Busca detalhes de uso de um tenant
   */
  async getUsageDetails(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            companies: true,
            attendanceCards: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant não encontrado");
    }

    // Métricas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cardsLast30Days = await prisma.attendanceCard.count({
      where: {
        tenantId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    return {
      tenant,
      usage: {
        cardsLast30Days,
        totalUsers: tenant.users.length,
        activeUsers: tenant.users.filter((u) => u.isActive).length,
      },
    };
  },

  /**
   * Verifica se o tenant pode adicionar mais usuários
   */
  async canAddUser(tenantId: string): Promise<boolean> {
    const tenant = await this.getById(tenantId);

    const currentUsers = await prisma.user.count({
      where: { tenantId, isActive: true },
    });

    return currentUsers < tenant.maxUsers;
  },

  /**
   * Dashboard com métricas de todos os tenants (para super admin)
   */
  async getDashboardMetrics() {
    const [totalTenants, activeTenants, totalUsers, totalCards, recentTenants] =
      await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.attendanceCard.count(),
        prisma.tenant.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                users: true,
                attendanceCards: true,
              },
            },
          },
        }),
      ]);

    // Métricas deste mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [newTenantsThisMonth, cardsThisMonth] = await Promise.all([
      prisma.tenant.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.attendanceCard.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      metrics: {
        totalTenants,
        activeTenants,
        totalUsers,
        totalCards,
        newTenantsThisMonth,
        cardsThisMonth,
      },
      recentTenants,
    };
  },
};
