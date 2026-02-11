-- AddForeignKey
ALTER TABLE "attendance_cards" ADD CONSTRAINT "attendance_cards_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
