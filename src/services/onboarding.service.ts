import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { ConflictError } from "../errors/AppError";
import { tenantService } from "./tenant.service";

// ═══════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════

export interface OnboardingDTO {
  // Dados da empresa
  companyName: string;
  plan?: string;

  // Dados do owner
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  password: string;
}

export interface OnboardingResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// ═══════════════════════════════════════════════════════
// SERVIÇO DE ONBOARDING
// Cria tenant + usuário owner em uma única transação
// ═══════════════════════════════════════════════════════

export const onboardingService = {
  /**
   * Cria um novo tenant com o usuário owner
   */
  async createTenant(data: OnboardingDTO): Promise<OnboardingResponse> {
    // Gera slug único
    const slug = tenantService.generateSlug(data.companyName);

    // Verifica se slug já existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictError(
        "Já existe uma empresa com nome similar cadastrada",
      );
    }

    // Verifica se email já existe em algum tenant
    const existingUser = await prisma.user.findFirst({
      where: { email: data.ownerEmail },
    });

    if (existingUser) {
      throw new ConflictError("Este email já está cadastrado");
    }

    // Define limites por plano
    const planLimits: Record<string, number> = {
      basic: 5,
      pro: 15,
      enterprise: 50,
    };

    const plan = data.plan || "basic";
    const maxUsers = planLimits[plan] || 5;

    // Criar tenant + usuário owner em transação
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar o tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          slug,
          plan,
          maxUsers,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          ownerPhone: data.ownerPhone,
        },
      });

      // 2. Criar hash da senha
      const passwordHash = await bcrypt.hash(data.password, 10);

      // 3. Criar usuário owner
      const user = await tx.user.create({
        data: {
          email: data.ownerEmail,
          name: data.ownerName,
          passwordHash,
          role: "owner", // Papel de dono da conta
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        plan: result.tenant.plan,
      },
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    };
  },

  /**
   * Adiciona um usuário a um tenant existente
   */
  async addUserToTenant(
    tenantId: string,
    userData: {
      name: string;
      email: string;
      password: string;
      role?: string;
    },
  ) {
    // Verifica se o tenant pode adicionar mais usuários
    const canAdd = await tenantService.canAddUser(tenantId);

    if (!canAdd) {
      throw new ConflictError(
        "Limite de usuários atingido. Faça upgrade do plano para adicionar mais usuários.",
      );
    }

    // Verifica se email já existe no tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: userData.email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictError("Este email já está cadastrado nesta empresa");
    }

    // Criar hash da senha
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        role: userData.role || "user",
        tenantId,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
};
