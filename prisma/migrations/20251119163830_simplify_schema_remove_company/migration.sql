/*
  Warnings:

  - You are about to drop the column `companyId` on the `service_cards` table. All the data in the column will be lost.
  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `service_cards` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."companies" DROP CONSTRAINT "companies_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_cards" DROP CONSTRAINT "service_cards_companyId_fkey";

-- AlterTable
ALTER TABLE "service_cards" DROP COLUMN "companyId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."companies";

-- AddForeignKey
ALTER TABLE "service_cards" ADD CONSTRAINT "service_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
