/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `companies` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable (primeiro para que as FKs funcionem)
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "ownerName" TEXT,
    "ownerEmail" TEXT,
    "ownerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- DropIndex
DROP INDEX "companies_name_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable users (adiciona campos novos)
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "tenantId" TEXT;

-- AlterTable attendance_cards
ALTER TABLE "attendance_cards" ADD COLUMN     "tenantId" TEXT;

-- AlterTable companies - primeiro adiciona como nullable
ALTER TABLE "companies" ADD COLUMN     "tenantId" TEXT;
ALTER TABLE "companies" ADD COLUMN     "userId" INTEGER;

-- Atualiza companies existentes com o primeiro userId disponível
UPDATE "companies" SET "userId" = (SELECT "id" FROM "users" LIMIT 1) WHERE "userId" IS NULL;

-- Agora torna userId NOT NULL
ALTER TABLE "companies" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "attendance_cards_tenantId_idx" ON "attendance_cards"("tenantId");

-- CreateIndex
CREATE INDEX "attendance_cards_tenantId_userId_idx" ON "attendance_cards"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "companies_tenantId_idx" ON "companies"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenantId_name_key" ON "companies"("tenantId", "name");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
