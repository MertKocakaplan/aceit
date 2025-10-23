/*
  Warnings:

  - You are about to drop the column `notes` on the `StudySession` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `targetDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notifications` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `pomodoroBreak` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `pomodoroWork` on the `UserPreference` table. All the data in the column will be lost.
  - The `theme` column on the `UserPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AIQuestionLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PomodoroSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudyGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudyPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudyPlanItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "public"."AIQuestionLog" DROP CONSTRAINT "AIQuestionLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamAttempt" DROP CONSTRAINT "ExamAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamResult" DROP CONSTRAINT "ExamResult_examAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamResult" DROP CONSTRAINT "ExamResult_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamTopic" DROP CONSTRAINT "ExamTopic_examDataId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamTopic" DROP CONSTRAINT "ExamTopic_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExamTopic" DROP CONSTRAINT "ExamTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PomodoroSession" DROP CONSTRAINT "PomodoroSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyGoal" DROP CONSTRAINT "StudyGoal_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyPlan" DROP CONSTRAINT "StudyPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudyPlanItem" DROP CONSTRAINT "StudyPlanItem_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudySession" DROP CONSTRAINT "StudySession_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey";

-- DropIndex
DROP INDEX "public"."Subject_examType_idx";

-- DropIndex
DROP INDEX "public"."Topic_subjectId_code_key";

-- DropIndex
DROP INDEX "public"."Topic_subjectId_idx";

-- DropIndex
DROP INDEX "public"."User_email_idx";

-- DropIndex
DROP INDEX "public"."User_examType_idx";

-- AlterTable
ALTER TABLE "public"."StudySession" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "public"."Subject" ALTER COLUMN "color" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Topic" DROP COLUMN "code",
ADD COLUMN     "averageQuestions" DOUBLE PRECISION,
ADD COLUMN     "importanceScore" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "order" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "targetDate",
ADD COLUMN     "dailyStudyGoal" INTEGER,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "public"."UserPreference" DROP COLUMN "notifications",
DROP COLUMN "pomodoroBreak",
DROP COLUMN "pomodoroWork",
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pomodoroBreakDuration" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "pomodoroWorkDuration" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "theme",
ADD COLUMN     "theme" "public"."ThemeMode" NOT NULL DEFAULT 'SYSTEM';

-- DropTable
DROP TABLE "public"."AIQuestionLog";

-- DropTable
DROP TABLE "public"."Achievement";

-- DropTable
DROP TABLE "public"."ExamAttempt";

-- DropTable
DROP TABLE "public"."ExamData";

-- DropTable
DROP TABLE "public"."ExamResult";

-- DropTable
DROP TABLE "public"."ExamTopic";

-- DropTable
DROP TABLE "public"."PomodoroSession";

-- DropTable
DROP TABLE "public"."StudyGoal";

-- DropTable
DROP TABLE "public"."StudyPlan";

-- DropTable
DROP TABLE "public"."StudyPlanItem";

-- DropTable
DROP TABLE "public"."UserAchievement";

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

-- CreateIndex
CREATE INDEX "StudySession_topicId_idx" ON "public"."StudySession"("topicId");

-- AddForeignKey
ALTER TABLE "public"."StudySession" ADD CONSTRAINT "StudySession_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicQuestionCount" ADD CONSTRAINT "TopicQuestionCount_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicQuestionCount" ADD CONSTRAINT "TopicQuestionCount_examYearId_fkey" FOREIGN KEY ("examYearId") REFERENCES "public"."ExamYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTopicRecommendation" ADD CONSTRAINT "UserTopicRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTopicRecommendation" ADD CONSTRAINT "UserTopicRecommendation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
