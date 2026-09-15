-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "resetTokenHash" TEXT,
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);
