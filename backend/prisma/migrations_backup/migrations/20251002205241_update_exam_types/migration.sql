-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ExamType" ADD VALUE 'TYT';
ALTER TYPE "public"."ExamType" ADD VALUE 'AYT_SAYISAL';
ALTER TYPE "public"."ExamType" ADD VALUE 'AYT_ESIT_AGIRLIK';
ALTER TYPE "public"."ExamType" ADD VALUE 'AYT_SOZEL';
ALTER TYPE "public"."ExamType" ADD VALUE 'AYT_DIL';
