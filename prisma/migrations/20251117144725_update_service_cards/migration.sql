/*
  Warnings:

  - You are about to drop the column `description` on the `service_cards` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `service_cards` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `service_cards` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `service_cards` table. All the data in the column will be lost.
  - Added the required column `tipoEvento` to the `service_cards` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."service_cards" DROP CONSTRAINT "service_cards_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_cards" DROP CONSTRAINT "service_cards_userId_fkey";

-- AlterTable
ALTER TABLE "service_cards" DROP COLUMN "description",
DROP COLUMN "status",
DROP COLUMN "title",
DROP COLUMN "userId",
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "isRunning" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tipoEvento" TEXT NOT NULL,
ADD COLUMN     "totalHours" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "service_cards" ADD CONSTRAINT "service_cards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
