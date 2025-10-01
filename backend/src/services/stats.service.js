const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Genel özet istatistikler
 */
const getSummaryStats = async (userId) => {
  try {
    // Toplam çalışma istatistikleri
    const totalStats = await prisma.studySession.aggregate({
      where: { userId },
      _sum: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
      },
      _count: true,
    });

    // Benzersiz çalışma günleri
    const uniqueDays = await prisma.studySession.groupBy({
      by: ['date'],
      where: { userId },
    });

    // Toplam soru sayısı
    const totalQuestions =
      (totalStats._sum.questionsCorrect || 0) +
      (totalStats._sum.questionsWrong || 0) +
      (totalStats._sum.questionsEmpty || 0);

    // Başarı oranı
    const successRate =
      totalQuestions > 0
        ? ((totalStats._sum.questionsCorrect || 0) / totalQuestions) * 100
        : 0;

    // En çok çalışılan ders
    const mostStudiedSubject = await prisma.studySession.groupBy({
      by: ['subjectId'],
      where: { userId },
      _sum: { duration: true },
      orderBy: { _sum: { duration: 'desc' } },
      take: 1,
    });

    let mostStudiedSubjectData = null;
    if (mostStudiedSubject.length > 0) {
      const subject = await prisma.subject.findUnique({
        where: { id: mostStudiedSubject[0].subjectId },
        select: { id: true, name: true, color: true },
      });
      mostStudiedSubjectData = {
        ...subject,
        totalDuration: mostStudiedSubject[0]._sum.duration,
      };
    }

    return {
      totalSessions: totalStats._count,
      totalDuration: totalStats._sum.duration || 0,
      totalDurationHours: Math.round((totalStats._sum.duration || 0) / 60),
      totalStudyDays: uniqueDays.length,
      totalQuestions,
      totalCorrect: totalStats._sum.questionsCorrect || 0,
      totalWrong: totalStats._sum.questionsWrong || 0,
      totalEmpty: totalStats._sum.questionsEmpty || 0,
      successRate: Math.round(successRate * 10) / 10,
      mostStudiedSubject: mostStudiedSubjectData,
    };
  } catch (error) {
    logger.error(`getSummaryStats error: ${error.message}`);
    throw error;
  }
};

/**
 * Son N gün için günlük istatistikler
 */
const getDailyStats = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Günlük olarak grupla
    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      dailyMap[dateKey] = {
        date: dateKey,
        duration: 0,
        sessions: 0,
        correct: 0,
        wrong: 0,
        empty: 0,
      };
    }

    sessions.forEach((session) => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].duration += session.duration;
        dailyMap[dateKey].sessions += 1;
        dailyMap[dateKey].correct += session.questionsCorrect;
        dailyMap[dateKey].wrong += session.questionsWrong;
        dailyMap[dateKey].empty += session.questionsEmpty;
      }
    });

    return Object.values(dailyMap);
  } catch (error) {
    logger.error(`getDailyStats error: ${error.message}`);
    throw error;
  }
};

/**
 * Haftalık karşılaştırma
 */
const getWeeklyComparison = async (userId) => {
  try {
    const now = new Date();
    
    // Bu haftanın başlangıcı (Pazartesi)
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Geçen haftanın başlangıcı
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);

    // Bu hafta
    const thisWeek = await prisma.studySession.aggregate({
      where: {
        userId,
        date: { gte: thisWeekStart },
      },
      _sum: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
      },
      _count: true,
    });

    // Geçen hafta
    const lastWeek = await prisma.studySession.aggregate({
      where: {
        userId,
        date: {
          gte: lastWeekStart,
          lt: lastWeekEnd,
        },
      },
      _sum: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
      },
      _count: true,
    });

    // Değişim yüzdeleri
    const durationChange =
      lastWeek._sum.duration > 0
        ? (((thisWeek._sum.duration || 0) - (lastWeek._sum.duration || 0)) /
            (lastWeek._sum.duration || 1)) *
          100
        : 0;

    const questionsChange =
      (lastWeek._sum.questionsCorrect || 0) > 0
        ? (((thisWeek._sum.questionsCorrect || 0) -
            (lastWeek._sum.questionsCorrect || 0)) /
            ((lastWeek._sum.questionsCorrect || 1))) *
          100
        : 0;

    return {
      thisWeek: {
        sessions: thisWeek._count,
        duration: thisWeek._sum.duration || 0,
        correct: thisWeek._sum.questionsCorrect || 0,
        wrong: thisWeek._sum.questionsWrong || 0,
        empty: thisWeek._sum.questionsEmpty || 0,
      },
      lastWeek: {
        sessions: lastWeek._count,
        duration: lastWeek._sum.duration || 0,
        correct: lastWeek._sum.questionsCorrect || 0,
        wrong: lastWeek._sum.questionsWrong || 0,
        empty: lastWeek._sum.questionsEmpty || 0,
      },
      comparison: {
        durationChange: Math.round(durationChange),
        questionsChange: Math.round(questionsChange),
      },
    };
  } catch (error) {
    logger.error(`getWeeklyComparison error: ${error.message}`);
    throw error;
  }
};

/**
 * Aylık karşılaştırma
 */
const getMonthlyComparison = async (userId) => {
  try {
    const now = new Date();
    
    // Bu ayın başlangıcı
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Geçen ayın başlangıcı
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const lastMonthEnd = new Date(thisMonthStart);

    // Bu ay
    const thisMonth = await prisma.studySession.aggregate({
      where: {
        userId,
        date: { gte: thisMonthStart },
      },
      _sum: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
      },
      _count: true,
    });

    // Geçen ay
    const lastMonth = await prisma.studySession.aggregate({
      where: {
        userId,
        date: {
          gte: lastMonthStart,
          lt: lastMonthEnd,
        },
      },
      _sum: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
      },
      _count: true,
    });

    // Değişim yüzdeleri
    const durationChange =
      lastMonth._sum.duration > 0
        ? (((thisMonth._sum.duration || 0) - (lastMonth._sum.duration || 0)) /
            (lastMonth._sum.duration || 1)) *
          100
        : 0;

    const questionsChange =
      (lastMonth._sum.questionsCorrect || 0) > 0
        ? (((thisMonth._sum.questionsCorrect || 0) -
            (lastMonth._sum.questionsCorrect || 0)) /
            ((lastMonth._sum.questionsCorrect || 1))) *
          100
        : 0;

    return {
      thisMonth: {
        sessions: thisMonth._count,
        duration: thisMonth._sum.duration || 0,
        correct: thisMonth._sum.questionsCorrect || 0,
        wrong: thisMonth._sum.questionsWrong || 0,
        empty: thisMonth._sum.questionsEmpty || 0,
      },
      lastMonth: {
        sessions: lastMonth._count,
        duration: lastMonth._sum.duration || 0,
        correct: lastMonth._sum.questionsCorrect || 0,
        wrong: lastMonth._sum.questionsWrong || 0,
        empty: lastMonth._sum.questionsEmpty || 0,
      },
      comparison: {
        durationChange: Math.round(durationChange),
        questionsChange: Math.round(questionsChange),
      },
    };
  } catch (error) {
    logger.error(`getMonthlyComparison error: ${error.message}`);
    throw error;
  }
};

/**
 * Ders bazlı dağılım
 */
const getSubjectBreakdown = async (userId) => {
  try {
    const subjectStats = await prisma.studySession.groupBy({
      by: ['subjectId'],
      where: { userId },
      _sum: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
      },
      _count: true,
    });

    // Subject bilgilerini ekle
    const breakdown = await Promise.all(
      subjectStats.map(async (stat) => {
        const subject = await prisma.subject.findUnique({
          where: { id: stat.subjectId },
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        });

        const totalQuestions =
          (stat._sum.questionsCorrect || 0) +
          (stat._sum.questionsWrong || 0) +
          (stat._sum.questionsEmpty || 0);

        const successRate =
          totalQuestions > 0
            ? ((stat._sum.questionsCorrect || 0) / totalQuestions) * 100
            : 0;

        return {
          subject,
          sessions: stat._count,
          duration: stat._sum.duration || 0,
          totalQuestions,
          correct: stat._sum.questionsCorrect || 0,
          wrong: stat._sum.questionsWrong || 0,
          empty: stat._sum.questionsEmpty || 0,
          successRate: Math.round(successRate * 10) / 10,
        };
      })
    );

    // Süreye göre sırala
    breakdown.sort((a, b) => b.duration - a.duration);

    return breakdown;
  } catch (error) {
    logger.error(`getSubjectBreakdown error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getSummaryStats,
  getDailyStats,
  getWeeklyComparison,
  getMonthlyComparison,
  getSubjectBreakdown,
};