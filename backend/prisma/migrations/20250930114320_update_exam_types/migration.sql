/*
  Warnings:

  - The values [YKS_TYT,YKS_AYT,YKS_YDT,KPSS_GY,KPSS_GK,ALES,DGS,CUSTOM] on the enum `ExamType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ExamType_new" AS ENUM ('LGS', 'YKS_SAYISAL', 'YKS_ESIT_AGIRLIK', 'YKS_SOZEL', 'YKS_DIL');
ALTER TABLE "public"."User" ALTER COLUMN "examType" TYPE "public"."ExamType_new" USING ("examType"::text::"public"."ExamType_new");
ALTER TABLE "public"."Subject" ALTER COLUMN "examType" TYPE "public"."ExamType_new" USING ("examType"::text::"public"."ExamType_new");
ALTER TABLE "public"."ExamData" ALTER COLUMN "examType" TYPE "public"."ExamType_new" USING ("examType"::text::"public"."ExamType_new");
ALTER TYPE "public"."ExamType" RENAME TO "ExamType_old";
ALTER TYPE "public"."ExamType_new" RENAME TO "ExamType";
DROP TYPE "public"."ExamType_old";
COMMIT;
