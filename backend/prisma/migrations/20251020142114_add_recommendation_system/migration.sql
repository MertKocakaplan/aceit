/*
  Warnings:

  - You are about to drop the column `averageQuestions` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `importanceScore` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `dailyStudyGoal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notificationsEnabled` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `pomodoroBreakDuration` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `pomodoroWorkDuration` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `soundEnabled` on the `UserPreference` table. All the data in the column will be lost.
  - The `theme` column on the `UserPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ExamYear` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopicQuestionCount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTopicRecommendation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[subjectId,code]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."StudySession" DROP CONSTRAINT "StudySession_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TopicQuestionCount" DROP CONSTRAINT "TopicQuestionCount_examYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TopicQuestionCount" DROP CONSTRAINT "TopicQuestionCount_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTopicRecommendation" DROP CONSTRAINT "UserTopicRecommendation_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTopicRecommendation" DROP CONSTRAINT "UserTopicRecommendation_userId_fkey";

-- DropIndex
DROP INDEX "public"."StudySession_topicId_idx";

-- AlterTable
ALTER TABLE "public"."StudySession" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "public"."Subject" ALTER COLUMN "color" SET DEFAULT '#3b82f6';

-- AlterTable
ALTER TABLE "public"."Topic" DROP COLUMN "averageQuestions",
DROP COLUMN "importanceScore",
DROP COLUMN "updatedAt",
ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "order" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "dailyStudyGoal",
DROP COLUMN "role",
ADD COLUMN     "targetDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."UserPreference" DROP COLUMN "notificationsEnabled",
DROP COLUMN "pomodoroBreakDuration",
DROP COLUMN "pomodoroWorkDuration",
DROP COLUMN "soundEnabled",
ADD COLUMN     "notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pomodoroBreak" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "pomodoroWork" INTEGER NOT NULL DEFAULT 25,
DROP COLUMN "theme",
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';

-- DropTable
DROP TABLE "public"."ExamYear";

-- DropTable
DROP TABLE "public"."TopicQuestionCount";

-- DropTable
DROP TABLE "public"."UserTopicRecommendation";

-- DropEnum
DROP TYPE "public"."ThemeMode";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "public"."ExamData" (
    "id" TEXT NOT NULL,
    "examType" "public"."ExamType" NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamTopic" (
    "id" TEXT NOT NULL,
    "examDataId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "outcome" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "attemptDate" TIMESTAMP(3) NOT NULL,
    "totalNet" DOUBLE PRECISION NOT NULL,
    "estimatedRank" INTEGER,
    "estimatedScore" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamResult" (
    "id" TEXT NOT NULL,
    "examAttemptId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "correct" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "empty" INTEGER NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "targetNet" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudyPlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subjectId" TEXT,
    "topicName" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PomodoroSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "subjectName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PomodoroSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIQuestionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionImage" TEXT,
    "aiResponse" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "rating" INTEGER,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIQuestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamData_examType_key" ON "public"."ExamData"("examType");

-- CreateIndex
CREATE INDEX "ExamTopic_examDataId_idx" ON "public"."ExamTopic"("examDataId");

-- CreateIndex
CREATE INDEX "ExamTopic_subjectId_idx" ON "public"."ExamTopic"("subjectId");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_attemptDate_idx" ON "public"."ExamAttempt"("userId", "attemptDate");

-- CreateIndex
CREATE INDEX "ExamResult_examAttemptId_idx" ON "public"."ExamResult"("examAttemptId");

-- CreateIndex
CREATE INDEX "ExamResult_subjectId_idx" ON "public"."ExamResult"("subjectId");

-- CreateIndex
CREATE INDEX "StudyPlan_userId_isActive_idx" ON "public"."StudyPlan"("userId", "isActive");

-- CreateIndex
CREATE INDEX "StudyPlanItem_planId_idx" ON "public"."StudyPlanItem"("planId");

-- CreateIndex
CREATE INDEX "StudyGoal_userId_isCompleted_idx" ON "public"."StudyGoal"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "PomodoroSession_userId_date_idx" ON "public"."PomodoroSession"("userId", "date");

-- CreateIndex
CREATE INDEX "AIQuestionLog_userId_createdAt_idx" ON "public"."AIQuestionLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "public"."Achievement"("code");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "public"."UserAchievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "public"."UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "Subject_examType_idx" ON "public"."Subject"("examType");

-- CreateIndex
CREATE INDEX "Topic_subjectId_idx" ON "public"."Topic"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_code_key" ON "public"."Topic"("subjectId", "code");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_examType_idx" ON "public"."User"("examType");

-- AddForeignKey
ALTER TABLE "public"."StudySession" ADD CONSTRAINT "StudySession_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamTopic" ADD CONSTRAINT "ExamTopic_examDataId_fkey" FOREIGN KEY ("examDataId") REFERENCES "public"."ExamData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamTopic" ADD CONSTRAINT "ExamTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamTopic" ADD CONSTRAINT "ExamTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamResult" ADD CONSTRAINT "ExamResult_examAttemptId_fkey" FOREIGN KEY ("examAttemptId") REFERENCES "public"."ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamResult" ADD CONSTRAINT "ExamResult_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyPlanItem" ADD CONSTRAINT "StudyPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyGoal" ADD CONSTRAINT "StudyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PomodoroSession" ADD CONSTRAINT "PomodoroSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIQuestionLog" ADD CONSTRAINT "AIQuestionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
