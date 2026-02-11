import { PrismaClient } from '@prisma/client';

// Mock do Prisma para testes
export const prismaMock = {
    attendanceCard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    company: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    }
} as unknown as PrismaClient;

export const resetPrismaMock = () => {
    jest.clearAllMocks();
};