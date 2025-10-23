/*
  Warnings:

  - The `theme` column on the `UserPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "public"."Topic" ADD COLUMN     "averageQuestions" DOUBLE PRECISION,
ADD COLUMN     "importanceScore" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "dailyStudyGoal" INTEGER,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "public"."UserPreference" ADD COLUMN     "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "theme",
ADD COLUMN     "theme" "public"."ThemeMode" NOT NULL DEFAULT 'SYSTEM';

-- CreateTable
CREATE TABLE "public"."ExamYear" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "examDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TopicQuestionCount" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "examYearId" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicQuestionCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserTopicRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "priorityScore" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "recommendedMinutes" INTEGER NOT NULL,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTopicRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamYear_year_key" ON "public"."ExamYear"("year");

-- CreateIndex
CREATE INDEX "TopicQuestionCount_topicId_idx" ON "public"."TopicQuestionCount"("topicId");

-- CreateIndex
CREATE INDEX "TopicQuestionCount_examYearId_idx" ON "public"."TopicQuestionCount"("examYearId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicQuestionCount_topicId_examYearId_key" ON "public"."TopicQuestionCount"("topicId", "examYearId");

-- CreateIndex
CREATE INDEX "UserTopicRecommendation_userId_priorityScore_idx" ON "public"."UserTopicRecommendation"("userId", "priorityScore");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopicRecommendation_userId_topicId_key" ON "public"."UserTopicRecommendation"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "public"."TopicQuestionCount" ADD CONSTRAINT "TopicQuestionCount_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicQuestionCount" ADD CONSTRAINT "TopicQuestionCount_examYearId_fkey" FOREIGN KEY ("examYearId") REFERENCES "public"."ExamYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTopicRecommendation" ADD CONSTRAINT "UserTopicRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTopicRecommendation" ADD CONSTRAINT "UserTopicRecommendation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
