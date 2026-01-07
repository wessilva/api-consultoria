import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("⚠️ JWT_SECRET não configurado no .env");
}

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
  };
}

export class UserService {
  async createUser(data: CreateUserDTO) {
    // Verificar se o email já está em uso
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new Error("Email já cadastrado.");
    }

    // Criar hash da senha
    const passwordHash = await bcrypt.hash(data.password, 8);

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
    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Email ou senha incorretos.");
    }

    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Email ou senha incorretos.");
    }

    // Gerar o token JWT
    const token = jwt.sign({ id: user.id.toString() }, JWT_SECRET!, {
      expiresIn: "7d",
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
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
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return user;
  }
}
