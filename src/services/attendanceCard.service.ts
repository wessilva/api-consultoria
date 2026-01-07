import { prisma } from "../lib/prisma";
import {
  CreateAttendanceCardDTO,
  UpdateAttendanceCardDTO,
} from "../validators/attendanceCard.validator";

export class AttendanceCardService {
  async create(userId: number, data: CreateAttendanceCardDTO) {
    return await prisma.attendanceCard.create({
      data: {
        ...data,
        status: data.status || "pending",
        totalHours: data.totalHours || 0,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAllByUser(userId: number) {
    return await prisma.attendanceCard.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: number, userId: number) {
    const card = await prisma.attendanceCard.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!card) {
      throw new Error("Card de atendimento não encontrado");
    }

    if (card.userId !== userId) {
      throw new Error("Acesso negado");
    }

    return card;
  }

  async update(id: number, userId: number, data: UpdateAttendanceCardDTO) {
    // Verificar ownership
    await this.findById(id, userId);

    return await prisma.attendanceCard.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: number, userId: number) {
    // Verificar ownership
    await this.findById(id, userId);

    await prisma.attendanceCard.delete({
      where: { id },
    });
  }
}
