/*
  Warnings:

  - You are about to drop the `service_cards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "service_cards" DROP CONSTRAINT "service_cards_userId_fkey";

-- DropTable
DROP TABLE "service_cards";
