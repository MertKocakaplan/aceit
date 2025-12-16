-- CreateEnum
CREATE TYPE "public"."ExamType" AS ENUM ('LGS', 'TYT', 'AYT_MATEMATIK', 'AYT_FIZIK', 'AYT_KIMYA', 'AYT_BIYOLOJI', 'AYT_EDEBIYAT', 'AYT_TARIH', 'AYT_COGRAFYA', 'AYT_FELSEFE', 'AYT_DIN', 'YKS_SAYISAL', 'YKS_ESIT_AGIRLIK', 'YKS_SOZEL', 'YKS_DIL', 'AYT', 'AYT_GEOMETRI');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "examType" "public"."ExamType" NOT NULL,
    "targetScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "learningVelocity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pomodoroLongBreak" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "pomodoroBreak" INTEGER NOT NULL DEFAULT 5,
    "pomodoroWork" INTEGER NOT NULL DEFAULT 25,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "theme" "public"."ThemeMode" NOT NULL DEFAULT 'SYSTEM',
    "dailyStudyHoursTarget" INTEGER NOT NULL DEFAULT 4,
    "preferredStudyEndHour" INTEGER,
    "preferredStudyStartHour" INTEGER,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "questionsWrong" INTEGER NOT NULL DEFAULT 0,
    "questionsEmpty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "examType" "public"."ExamType" NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Topic" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "averageQuestions" DOUBLE PRECISION,
    "importanceScore" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "difficultyLevel" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

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
    "aiExplanation" TEXT,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "weeklyGoals" TEXT,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudyPlanDay" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayNote" TEXT,
    "dailyGoalMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyPlanDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudyPlanSlot" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "slotType" TEXT NOT NULL DEFAULT 'study',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "aiReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyPlanSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PomodoroSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mode" TEXT NOT NULL,
    "subjectId" TEXT,

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
    "responseTime" INTEGER,

    CONSTRAINT "AIQuestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserTopicSpacedRepetition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "lastStudiedAt" TIMESTAMP(3) NOT NULL,
    "nextReviewAt" TIMESTAMP(3) NOT NULL,
    "repetitionLevel" INTEGER NOT NULL DEFAULT 0,
    "easinessFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "consecutiveCorrect" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTopicSpacedRepetition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_examType_idx" ON "public"."User"("examType");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "public"."UserPreference"("userId");

-- CreateIndex
CREATE INDEX "StudySession_userId_date_idx" ON "public"."StudySession"("userId", "date");

-- CreateIndex
CREATE INDEX "StudySession_subjectId_idx" ON "public"."StudySession"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "public"."Subject"("code");

-- CreateIndex
CREATE INDEX "Subject_examType_idx" ON "public"."Subject"("examType");

-- CreateIndex
CREATE INDEX "Topic_subjectId_idx" ON "public"."Topic"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_code_key" ON "public"."Topic"("subjectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ExamYear_year_key" ON "public"."ExamYear"("year");

-- CreateIndex
CREATE INDEX "TopicQuestionCount_topicId_idx" ON "public"."TopicQuestionCount"("topicId");

-- CreateIndex
CREATE INDEX "TopicQuestionCount_examYearId_idx" ON "public"."TopicQuestionCount"("examYearId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicQuestionCount_topicId_examYearId_key" ON "public"."TopicQuestionCount"("topicId", "examYearId");

-- CreateIndex
CREATE INDEX "StudyPlan_userId_isActive_idx" ON "public"."StudyPlan"("userId", "isActive");

-- CreateIndex
CREATE INDEX "StudyPlanDay_planId_date_idx" ON "public"."StudyPlanDay"("planId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanDay_planId_date_key" ON "public"."StudyPlanDay"("planId", "date");

-- CreateIndex
CREATE INDEX "StudyPlanSlot_dayId_startTime_idx" ON "public"."StudyPlanSlot"("dayId", "startTime");

-- CreateIndex
CREATE INDEX "PomodoroSession_userId_date_idx" ON "public"."PomodoroSession"("userId", "date");

-- CreateIndex
CREATE INDEX "AIQuestionLog_userId_createdAt_idx" ON "public"."AIQuestionLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserTopicSpacedRepetition_userId_nextReviewAt_idx" ON "public"."UserTopicSpacedRepetition"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "UserTopicSpacedRepetition_nextReviewAt_idx" ON "public"."UserTopicSpacedRepetition"("nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopicSpacedRepetition_userId_topicId_key" ON "public"."UserTopicSpacedRepetition"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "public"."UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudySession" ADD CONSTRAINT "StudySession_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudySession" ADD CONSTRAINT "StudySession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicQuestionCount" ADD CONSTRAINT "TopicQuestionCount_examYearId_fkey" FOREIGN KEY ("examYearId") REFERENCES "public"."ExamYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicQuestionCount" ADD CONSTRAINT "TopicQuestionCount_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyPlanDay" ADD CONSTRAINT "StudyPlanDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyPlanSlot" ADD CONSTRAINT "StudyPlanSlot_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."StudyPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyPlanSlot" ADD CONSTRAINT "StudyPlanSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyPlanSlot" ADD CONSTRAINT "StudyPlanSlot_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PomodoroSession" ADD CONSTRAINT "PomodoroSession_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PomodoroSession" ADD CONSTRAINT "PomodoroSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIQuestionLog" ADD CONSTRAINT "AIQuestionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTopicSpacedRepetition" ADD CONSTRAINT "UserTopicSpacedRepetition_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTopicSpacedRepetition" ADD CONSTRAINT "UserTopicSpacedRepetition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
