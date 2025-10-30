const prisma = require('../config/database');
const logger = require('../utils/logger');
const spacedRepetitionService = require('./spacedRepetition.service');

/**
 * Kullanıcının tam performans analizini yap
 * AI'ya gönderilecek tüm veriler
 */
const analyzeUserPerformance = async (userId) => {
  try {
    // 1. Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // 2. Son 30 günlük çalışma kayıtlarını al
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      include: {
        subject: true,
        topic: true,
      },
      orderBy: { date: 'desc' },
    });

    // 3. Ders bazlı analiz
    const subjectAnalysis = calculateSubjectStats(sessions);

    // 4. Konu bazlı analiz
    const topicAnalysis = await calculateTopicStats(userId, sessions);

    // 5. Tekrar edilmesi gereken konular (Spaced Repetition)
    const dueReviews = await spacedRepetitionService.getTopicsDueForReview(
      userId,
      50
    );

    // 6. Zayıf konuları tespit et
    const weakTopics = identifyWeakTopics(topicAnalysis, dueReviews);

    // 7. Sınav ağırlıklarını al
    const examWeights = await getExamWeights(user.examType);

    // 8. Konuları önceliklendir (Skor algoritması)
    const prioritizedTopics = await prioritizeTopics(
      userId,
      topicAnalysis,
      weakTopics,
      dueReviews,
      examWeights,
      user.examType
    );

    // 9. Zaman analizi
    const timeAnalysis = calculateTimeAvailable(user);

    return {
      user: {
        id: user.id,
        examType: user.examType,
        targetDate: user.targetDate,
        targetScore: user.targetScore,
        learningVelocity: user.learningVelocity,
        dailyStudyGoal: user.dailyStudyGoal,
        preferences: user.preferences,
      },
      subjectAnalysis,
      topicAnalysis,
      weakTopics,
      dueReviews: dueReviews.map((r) => ({
        topicId: r.topic.id,
        topicName: r.topic.name,
        topicCode: r.topic.code,
        subjectName: r.topic.subject.name,
        subjectCode: r.topic.subject.code,
        subjectColor: r.topic.subject.color,
        daysOverdue: r.daysOverdue,
        repetitionLevel: r.repetitionLevel,
      })),
      examWeights,
      prioritizedTopics: prioritizedTopics.slice(0, 30), // Top 30
      timeAnalysis,
      summary: {
        totalStudySessions: sessions.length,
        totalStudyHours: Math.round((sessions.reduce((sum, s) => sum + s.duration, 0) / 60) * 10) / 10,
        averageSuccessRate: sessions.length > 0 ? calculateAverageSuccessRate(sessions) : 0,
        weakSubjectCount: Object.values(subjectAnalysis).filter((s) => s.successRate < 0.6).length,
        dueReviewCount: dueReviews.length,
      },
    };
  } catch (error) {
    logger.error(`analyzeUserPerformance error: ${error.message}`);
    throw error;
  }
};

/**
 * Ders bazlı istatistikler
 */
const calculateSubjectStats = (sessions) => {
  const subjectMap = {};

  sessions.forEach((session) => {
    const subjectCode = session.subject.code;
    if (!subjectMap[subjectCode]) {
      subjectMap[subjectCode] = {
        subjectId: session.subject.id,
        subjectName: session.subject.name,
        subjectCode: session.subject.code,
        subjectColor: session.subject.color,
        totalSessions: 0,
        totalDuration: 0,
        totalQuestions: 0,
        correctQuestions: 0,
        wrongQuestions: 0,
        emptyQuestions: 0,
        successRate: 0,
        averageSessionDuration: 0,
      };
    }

    const stats = subjectMap[subjectCode];
    stats.totalSessions++;
    stats.totalDuration += session.duration;
    stats.correctQuestions += session.questionsCorrect;
    stats.wrongQuestions += session.questionsWrong;
    stats.emptyQuestions += session.questionsEmpty;
    stats.totalQuestions +=
      session.questionsCorrect + session.questionsWrong + session.questionsEmpty;
  });

  // Hesaplamaları tamamla
  Object.values(subjectMap).forEach((stats) => {
    stats.successRate =
      stats.totalQuestions > 0
        ? stats.correctQuestions / stats.totalQuestions
        : 0;
    stats.averageSessionDuration = stats.totalDuration / stats.totalSessions;
  });

  return subjectMap;
};

/**
 * Konu bazlı istatistikler
 */
const calculateTopicStats = async (userId, sessions) => {
  const topicMap = {};

  // Session'lardan konu istatistiklerini çıkar
  sessions.forEach((session) => {
    if (!session.topic) return;

    const topicCode = session.topic.code;
    if (!topicMap[topicCode]) {
      topicMap[topicCode] = {
        topicId: session.topic.id,
        topicName: session.topic.name,
        topicCode: session.topic.code,
        subjectId: session.subject.id,
        subjectName: session.subject.name,
        subjectCode: session.subject.code,
        subjectColor: session.subject.color,
        difficultyLevel: session.topic.difficultyLevel,
        totalSessions: 0,
        totalDuration: 0,
        totalQuestions: 0,
        correctQuestions: 0,
        wrongQuestions: 0,
        successRate: 0,
        lastStudied: null,
      };
    }

    const stats = topicMap[topicCode];
    stats.totalSessions++;
    stats.totalDuration += session.duration;
    stats.correctQuestions += session.questionsCorrect;
    stats.wrongQuestions += session.questionsWrong;
    stats.totalQuestions +=
      session.questionsCorrect + session.questionsWrong + session.questionsEmpty;

    if (!stats.lastStudied || session.date > stats.lastStudied) {
      stats.lastStudied = session.date;
    }
  });

  // Hesaplamaları tamamla
  Object.values(topicMap).forEach((stats) => {
    stats.successRate =
      stats.totalQuestions > 0
        ? stats.correctQuestions / stats.totalQuestions
        : 0;
  });

  return topicMap;
};

/**
 * Zayıf konuları tespit et
 */
const identifyWeakTopics = (topicAnalysis, dueReviews) => {
  const weakTopics = [];

  Object.values(topicAnalysis).forEach((topic) => {
    // Zayıf konu kriterleri:
    // 1. Başarı oranı < %60
    // 2. En az 5 soru çözülmüş (güvenilir veri)
    if (topic.totalQuestions >= 5 && topic.successRate < 0.6) {
      weakTopics.push({
        ...topic,
        weaknessReason: `%${Math.round(topic.successRate * 100)} başarı oranı`,
        weaknessScore: 1 - topic.successRate,
      });
    }
  });

  // Gecikmiş tekrarları da zayıf olarak ekle
  dueReviews.forEach((review) => {
    if (review.daysOverdue > 0) {
      const existing = weakTopics.find((t) => t.topicId === review.topic.id);
      if (!existing) {
        weakTopics.push({
          topicId: review.topic.id,
          topicName: review.topic.name,
          topicCode: review.topic.code,
          subjectId: review.topic.subject.id,
          subjectName: review.topic.subject.name,
          subjectCode: review.topic.subject.code,
          subjectColor: review.topic.subject.color,
          weaknessReason: `${review.daysOverdue} gün gecikmiş tekrar`,
          weaknessScore: Math.min(review.daysOverdue / 7, 1),
        });
      }
    }
  });

  // Zayıflık skoruna göre sırala (en zayıf önce)
  return weakTopics.sort((a, b) => b.weaknessScore - a.weaknessScore);
};

/**
 * Sınav ağırlıklarını al (TopicQuestionCount'tan)
 */
const getExamWeights = async (examType) => {
  // Son aktif exam year'ı al
  const activeYear = await prisma.examYear.findFirst({
    where: { isActive: true },
    include: {
      topicStats: {
        include: {
          topic: {
            include: {
              subject: true,
            },
          },
        },
      },
    },
  });

  if (!activeYear) {
    logger.warn('Aktif exam year bulunamadı');
    return {};
  }

  const weights = {};

  activeYear.topicStats.forEach((stat) => {
    const topicCode = stat.topic.code;
    weights[topicCode] = {
      topicId: stat.topic.id,
      topicName: stat.topic.name,
      topicCode: stat.topic.code,
      subjectId: stat.topic.subject.id,
      subjectName: stat.topic.subject.name,
      subjectCode: stat.topic.subject.code,
      subjectColor: stat.topic.subject.color,
      questionCount: stat.questionCount,
      weight: stat.questionCount,
    };
  });

  return weights;
};

/**
 * Konuları önceliklendir (SKOR ALGORİTMASI)
 */
const prioritizeTopics = async (
  userId,
  topicAnalysis,
  weakTopics,
  dueReviews,
  examWeights,
  userExamType
) => {
  const prioritized = [];

  // Tüm konuları al (çalışılmamış olanlar için)
  const allTopics = await prisma.topic.findMany({
    include: {
      subject: true,
    },
  });

  // Kullanıcının erişebileceği konuları filtrele
  const subjectService = require('./subject.service');
  const accessibleTopics = allTopics.filter((topic) =>
    subjectService.checkSubjectAccess(userExamType, topic.subject, 'USER')
  );

  accessibleTopics.forEach((topic) => {
    const topicCode = topic.code;
    const analysis = topicAnalysis[topicCode] || {};
    const examWeight = examWeights[topicCode] || {};
    const isWeak = weakTopics.find((w) => w.topicCode === topicCode);
    const isDue = dueReviews.find((d) => d.topicCode === topicCode);

    // SKOR HESAPLAMA (0-1 arası)
    let priorityScore = 0;

    // 1. Sınav Ağırlığı (%40)
    const maxQuestionCount = Math.max(
      ...Object.values(examWeights).map((w) => w.questionCount || 0),
      1
    );
    const examScore = (examWeight.questionCount || 0) / maxQuestionCount;
    priorityScore += examScore * 0.4;

    // 2. Kullanıcı Zorluğu (%30)
    const userDifficultyScore = isWeak ? isWeak.weaknessScore : 0;
    priorityScore += userDifficultyScore * 0.3;

    // 3. Spaced Repetition Önceliği (%20)
    const spacedRepScore = isDue ? Math.min(isDue.daysOverdue / 7, 1) : 0;
    priorityScore += spacedRepScore * 0.2;

    // 4. Son Haftalık İlerleme (%10)
    const recentProgress = analysis.totalSessions || 0;
    const progressScore = Math.min(recentProgress / 5, 1);
    priorityScore += (1 - progressScore) * 0.1; // Az çalışılan = yüksek puan

    // Önerilen süre hesapla
    const baseMinutes = 60;
    const difficultyMultiplier = isWeak ? 1.5 : 1.0;
    const examMultiplier = 1 + examScore * 0.5;
    const recommendedMinutes = Math.round(
      baseMinutes * difficultyMultiplier * examMultiplier
    );

    prioritized.push({
      topicId: topic.id,
      topicName: topic.name,
      topicCode: topic.code,
      subjectId: topic.subject.id,
      subjectName: topic.subject.name,
      subjectCode: topic.subject.code,
      subjectColor: topic.subject.color,
      priorityScore: Math.round(priorityScore * 100) / 100,
      recommendedMinutes,
      reasons: [
        examWeight.questionCount > 0 &&
          `Sınavda ${examWeight.questionCount} soru`,
        isWeak && isWeak.weaknessReason,
        isDue && `${isDue.daysOverdue} gün gecikmiş tekrar`,
        analysis.totalSessions === 0 && 'Henüz çalışılmadı',
      ].filter(Boolean),
      stats: {
        totalSessions: analysis.totalSessions || 0,
        successRate: Math.round((analysis.successRate || 0) * 100) / 100,
        lastStudied: analysis.lastStudied || null,
        examQuestionCount: examWeight.questionCount || 0,
      },
    });
  });

  // Skor'a göre sırala (yüksekten düşüğe)
  return prioritized.sort((a, b) => b.priorityScore - a.priorityScore);
};

/**
 * Zaman analizi
 */
const calculateTimeAvailable = (user) => {
  const now = new Date();
  const targetDate = user.targetDate ? new Date(user.targetDate) : null;

  if (!targetDate) {
    return {
      hasTargetDate: false,
      remainingDays: null,
      totalAvailableHours: null,
      dailyCapacity: user.dailyStudyGoal || 4,
      studyStartHour: user.preferences?.preferredStudyStartHour || 9,
      studyEndHour: user.preferences?.preferredStudyEndHour || 22,
    };
  }

  const remainingMs = targetDate - now;
  const remainingDays = Math.max(
    Math.ceil(remainingMs / (1000 * 60 * 60 * 24)),
    0
  );
  const dailyCapacity =
    user.preferences?.dailyStudyHoursTarget || user.dailyStudyGoal || 4;
  const totalAvailableHours = remainingDays * dailyCapacity;

  return {
    hasTargetDate: true,
    targetDate,
    remainingDays,
    dailyCapacity,
    totalAvailableHours,
    studyStartHour: user.preferences?.preferredStudyStartHour || 9,
    studyEndHour: user.preferences?.preferredStudyEndHour || 22,
  };
};

/**
 * Ortalama başarı oranı
 */
const calculateAverageSuccessRate = (sessions) => {
  const totalQuestions = sessions.reduce(
    (sum, s) =>
      sum + s.questionsCorrect + s.questionsWrong + s.questionsEmpty,
    0
  );
  const correctQuestions = sessions.reduce(
    (sum, s) => sum + s.questionsCorrect,
    0
  );

  const rate = totalQuestions > 0 ? correctQuestions / totalQuestions : 0;
  return Math.round(rate * 100) / 100;
};

module.exports = {
  analyzeUserPerformance,
};