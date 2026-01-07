-- CreateTable
CREATE TABLE "attendance_cards" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "attendance_cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attendance_cards" ADD CONSTRAINT "attendance_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
