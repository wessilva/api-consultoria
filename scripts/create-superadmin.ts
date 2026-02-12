import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createSuperAdmin() {
  // ═══════════════════════════════════════════════════════
  // CONFIGURE AQUI OS DADOS DO SUPER ADMIN
  // ═══════════════════════════════════════════════════════
  const SUPER_ADMIN = {
    email: "wesley@admin.com",
    name: "Wesley Silva",
    password: "admin123", // Troque por uma senha forte!
  };

  console.log("═══════════════════════════════════════════════════════");
  console.log("🔐 CRIANDO SUPER ADMIN");
  console.log("═══════════════════════════════════════════════════════\n");

  try {
    // Verifica se já existe
    const existing = await prisma.user.findFirst({
      where: {
        email: SUPER_ADMIN.email,
        tenantId: null, // Super admin não tem tenant
      },
    });

    if (existing) {
      console.log("⚠️  Super Admin já existe!");
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
      return;
    }

    // Cria o hash da senha
    const passwordHash = await bcrypt.hash(SUPER_ADMIN.password, 10);

    // Cria o super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: SUPER_ADMIN.email,
        name: SUPER_ADMIN.name,
        passwordHash,
        role: "superadmin",
        tenantId: null, // Não pertence a nenhum tenant
        isActive: true,
      },
    });

    console.log("✅ Super Admin criado com sucesso!\n");
    console.log("📧 Email:", superAdmin.email);
    console.log("👤 Nome:", superAdmin.name);
    console.log("🔑 Senha:", SUPER_ADMIN.password);
    console.log("🛡️  Role:", superAdmin.role);
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("⚠️  IMPORTANTE: Troque a senha após o primeiro login!");
    console.log("═══════════════════════════════════════════════════════");
  } catch (error) {
    console.error("❌ Erro ao criar Super Admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
