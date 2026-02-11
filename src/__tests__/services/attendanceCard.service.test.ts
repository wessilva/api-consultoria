jest.mock("../../lib/prisma", () => ({
  prisma: {
    attendanceCard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { AttendanceCardService } from "../../services/attendanceCard.service";
import { prisma } from "../../lib/prisma";


const mockedPrisma = jest.mocked(prisma)

describe("AttendanceCardService", () => {
  let service: AttendanceCardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AttendanceCardService();
  });

  describe("create", () => {
    it("deve criar um card de atendimento com sucesso", async () => {
      const userId = 1;
      const cardData = {
        company: "Empresa Teste",
        eventType: "reuniao" as const,
        description: "Descrição do atendimento teste 1",
        status: "pending" as const,
        totalHours: 0,
      };

      const mockCreatedCard = {
        id: 1,
        ...cardData,
        status: "pending",
        totalHours: 0,
        userId,
        createdAt: new Date(),
        company: "Empresa Teste",
        eventType: "reuniao",
        description: "Descrição Adicional Teste",
        user: { id: userId, name: "Usuário Teste", email: "teste@teste.com" },
      };

      (mockedPrisma.attendanceCard.create as jest.Mock).mockResolvedValue(
        mockCreatedCard,
      );

      const result = await service.create(userId, cardData);

      expect(mockedPrisma.attendanceCard.create).toHaveBeenCalledWith({
        data: {
          ...cardData,
          status: "pending",
          totalHours: 0,
          userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      expect(result).toEqual(mockCreatedCard);
    });
  });
});
