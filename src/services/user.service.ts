import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env"; // ✅ Usa variáveis validadas
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../errors/AppError"; // ✅ Usa erros customizados

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    tenantId: string | null;
  };
}

export class UserService {
  async createUser(data: CreateUserDTO) {
    // Verificar se o email já está em uso (sem tenant = super admin)
    const emailExists = await prisma.user.findFirst({
      where: { email: data.email, tenantId: null },
    });

    if (emailExists) {
      throw new ConflictError("Email já cadastrado"); // ✅ Erro 409
    }

    // Criar hash da senha (10 rounds é o padrão seguro)
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: passwordHash,
      },
    });

    return user;
  }

  async authenticate(email: string, password: string): Promise<AuthResponse> {
    // Buscar o usuário pelo email (usando findFirst porque email não é unique sozinho)
    const user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedError("Email ou senha incorretos"); // ✅ Erro 401
    }

    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Email ou senha incorretos"); // ✅ Erro 401
    }

    // Gerar o token JWT usando as variáveis validadas
    const token = jwt.sign(
      {
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
      },
      String(env.JWT_SECRET),
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("Usuário não encontrado"); // ✅ Erro 404
    }

    return user;
  }
}
