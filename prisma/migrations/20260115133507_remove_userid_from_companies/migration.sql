/*
  Warnings:

  - You are about to drop the column `userId` on the `companies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `companies` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_userId_fkey";

-- DropIndex
DROP INDEX "companies_userId_name_key";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");
