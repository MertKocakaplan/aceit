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
    // JavaScript'te Sunday = 0, Monday = 1
    // Pazar günü için -6 gün (önceki Pazartesi), diğer günler için hesaplama
    const thisWeekStart = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    thisWeekStart.setDate(now.getDate() + daysToMonday);
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
    const lastWeekDuration = lastWeek._sum.duration || 0;
    const thisWeekDuration = thisWeek._sum.duration || 0;
    const lastWeekCorrect = lastWeek._sum.questionsCorrect || 0;
    const thisWeekCorrect = thisWeek._sum.questionsCorrect || 0;

    const durationChange =
      lastWeekDuration > 0
        ? ((thisWeekDuration - lastWeekDuration) / lastWeekDuration) * 100
        : thisWeekDuration > 0
        ? 100
        : 0;

    const questionsChange =
      lastWeekCorrect > 0
        ? ((thisWeekCorrect - lastWeekCorrect) / lastWeekCorrect) * 100
        : thisWeekCorrect > 0
        ? 100
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
    const lastMonthDuration = lastMonth._sum.duration || 0;
    const thisMonthDuration = thisMonth._sum.duration || 0;
    const lastMonthCorrect = lastMonth._sum.questionsCorrect || 0;
    const thisMonthCorrect = thisMonth._sum.questionsCorrect || 0;

    const durationChange =
      lastMonthDuration > 0
        ? ((thisMonthDuration - lastMonthDuration) / lastMonthDuration) * 100
        : thisMonthDuration > 0
        ? 100
        : 0;

    const questionsChange =
      lastMonthCorrect > 0
        ? ((thisMonthCorrect - lastMonthCorrect) / lastMonthCorrect) * 100
        : thisMonthCorrect > 0
        ? 100
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

/**
 * Streak verisi (üst üste kaç gün çalıştı)
 */
const getStreakData = async (userId) => {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    if (sessions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      };
    }

    // Benzersiz günleri al
    const uniqueDates = [...new Set(sessions.map(s => 
      new Date(s.date).toISOString().split('T')[0]
    ))].sort().reverse();

    // Mevcut streak hesapla
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastStudyDate = new Date(uniqueDates[0]);
    const daysSinceLastStudy = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));

    // Bugün veya dün çalıştıysa streak devam ediyor
    if (daysSinceLastStudy <= 1) {
      let checkDate = new Date(today);
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const studyDate = new Date(uniqueDates[i]);
        const diff = Math.floor((checkDate - studyDate) / (1000 * 60 * 60 * 24));
        
        if (diff <= 1) {
          currentStreak++;
          checkDate = studyDate;
        } else {
          break;
        }
      }
    }

    // En uzun streak'i bul
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const date1 = new Date(uniqueDates[i]);
      const date2 = new Date(uniqueDates[i + 1]);
      const diff = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastStudyDate: uniqueDates[0],
      totalStudyDays: uniqueDates.length,
    };
  } catch (error) {
    logger.error(`getStreakData error: ${error.message}`);
    throw error;
  }
};

/**
 * Rekorlar (en çok soru, en çok saat)
 */
const getRecords = async (userId) => {
  try {
    // En çok soru çözülen gün
    const allSessions = await prisma.studySession.findMany({
      where: { userId },
      select: {
        date: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
        duration: true,
      },
    });

    // Günlük toplamlar
    const dailyTotals = {};
    allSessions.forEach(session => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = {
          date: dateKey,
          questions: 0,
          duration: 0,
        };
      }
      dailyTotals[dateKey].questions += 
        session.questionsCorrect + session.questionsWrong + session.questionsEmpty;
      dailyTotals[dateKey].duration += session.duration;
    });

    const dailyArray = Object.values(dailyTotals);

    // En çok soru çözülen gün
    const mostQuestionsDay = dailyArray.reduce((max, day) => 
      day.questions > (max?.questions || 0) ? day : max, null);

    // En çok çalışılan gün
    const mostStudyDay = dailyArray.reduce((max, day) => 
      day.duration > (max?.duration || 0) ? day : max, null);

    // Haftalık rekorlar
    const weeklyTotals = {};
    allSessions.forEach(session => {
      const date = new Date(session.date);
      const weekStart = new Date(date);
      const dayOfWeek = date.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(date.getDate() + daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeklyTotals[weekKey]) {
        weeklyTotals[weekKey] = {
          weekStart: weekKey,
          questions: 0,
          duration: 0,
        };
      }
      weeklyTotals[weekKey].questions += 
        session.questionsCorrect + session.questionsWrong + session.questionsEmpty;
      weeklyTotals[weekKey].duration += session.duration;
    });

    const weeklyArray = Object.values(weeklyTotals);

    const mostQuestionsWeek = weeklyArray.reduce((max, week) => 
      week.questions > (max?.questions || 0) ? week : max, null);

    const mostStudyWeek = weeklyArray.reduce((max, week) => 
      week.duration > (max?.duration || 0) ? week : max, null);

    return {
      daily: {
        mostQuestions: mostQuestionsDay ? {
          date: mostQuestionsDay.date,
          count: mostQuestionsDay.questions,
        } : null,
        mostStudy: mostStudyDay ? {
          date: mostStudyDay.date,
          duration: mostStudyDay.duration,
        } : null,
      },
      weekly: {
        mostQuestions: mostQuestionsWeek ? {
          weekStart: mostQuestionsWeek.weekStart,
          count: mostQuestionsWeek.questions,
        } : null,
        mostStudy: mostStudyWeek ? {
          weekStart: mostStudyWeek.weekStart,
          duration: mostStudyWeek.duration,
        } : null,
      },
    };
  } catch (error) {
    logger.error(`getRecords error: ${error.message}`);
    throw error;
  }
};

/**
 * Başarı oranı trendi (son 4 hafta)
 */
const getSuccessRateTrend = async (userId) => {
  try {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: fourWeeksAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Haftalık gruplama
    const weeklyData = {};
    sessions.forEach(session => {
      const date = new Date(session.date);
      const weekStart = new Date(date);
      const dayOfWeek = date.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(date.getDate() + daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          correct: 0,
          wrong: 0,
          empty: 0,
        };
      }
      weeklyData[weekKey].correct += session.questionsCorrect;
      weeklyData[weekKey].wrong += session.questionsWrong;
      weeklyData[weekKey].empty += session.questionsEmpty;
    });

    const trend = Object.values(weeklyData).map(week => {
      const total = week.correct + week.wrong + week.empty;
      const successRate = total > 0 ? (week.correct / total) * 100 : 0;
      return {
        week: week.week,
        successRate: Math.round(successRate * 10) / 10,
        totalQuestions: total,
      };
    });

    // Trend direction (yükseliyor/düşüyor)
    let trendDirection = 'stable';
    if (trend.length >= 2) {
      const latest = trend[trend.length - 1].successRate;
      const previous = trend[trend.length - 2].successRate;
      if (latest > previous + 2) trendDirection = 'up';
      else if (latest < previous - 2) trendDirection = 'down';
    }

    return {
      trend,
      trendDirection,
      currentRate: trend.length > 0 ? trend[trend.length - 1].successRate : 0,
    };
  } catch (error) {
    logger.error(`getSuccessRateTrend error: ${error.message}`);
    throw error;
  }
};

/**
 * Hazırlık yüzdesi (konu tamamlama)
 */
const getPreparationProgress = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true },
    });

    // Kullanıcının erişebileceği tüm konuları al
    const subjectService = require('./subject.service');
    const allSubjects = await prisma.subject.findMany({
      include: {
        topics: true,
      },
    });

    const accessibleTopics = allSubjects
      .filter(subject => subjectService.checkSubjectAccess(user.examType, subject, 'USER'))
      .flatMap(subject => subject.topics);

    const totalTopics = accessibleTopics.length;

    // Çalışılmış konuları al
    const studiedTopics = await prisma.studySession.groupBy({
      by: ['topicId'],
      where: {
        userId,
        topicId: { not: null },
      },
      _count: true,
    });

    const studiedCount = studiedTopics.length;
    const percentage = totalTopics > 0 ? (studiedCount / totalTopics) * 100 : 0;

    return {
      totalTopics,
      studiedTopics: studiedCount,
      unstudiedTopics: totalTopics - studiedCount,
      percentage: Math.round(percentage * 10) / 10,
    };
  } catch (error) {
    logger.error(`getPreparationProgress error: ${error.message}`);
    throw error;
  }
};

/**
 * Gelişim hızı analizi
 */
const getLearningVelocityAnalysis = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { learningVelocity: true },
    });

    // Son 2 hafta vs önceki 2 hafta karşılaştırması
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);

    const lastTwoWeeks = await prisma.studySession.aggregate({
      where: {
        userId,
        date: { gte: twoWeeksAgo },
      },
      _sum: {
        duration: true,
        questionsCorrect: true,
      },
      _count: true,
    });

    const previousTwoWeeks = await prisma.studySession.aggregate({
      where: {
        userId,
        date: {
          gte: fourWeeksAgo,
          lt: twoWeeksAgo,
        },
      },
      _sum: {
        duration: true,
        questionsCorrect: true,
      },
      _count: true,
    });

    const durationIncrease = previousTwoWeeks._sum.duration > 0
      ? ((lastTwoWeeks._sum.duration - previousTwoWeeks._sum.duration) / previousTwoWeeks._sum.duration) * 100
      : 0;

    const efficiencyChange = previousTwoWeeks._sum.duration > 0
      ? ((lastTwoWeeks._sum.questionsCorrect / lastTwoWeeks._sum.duration) - 
         (previousTwoWeeks._sum.questionsCorrect / previousTwoWeeks._sum.duration))
      : 0;

    return {
      currentVelocity: user.learningVelocity,
      durationIncrease: Math.round(durationIncrease),
      efficiencyChange: Math.round(efficiencyChange * 100),
      status: user.learningVelocity >= 1.5 ? 'fast' : 
              user.learningVelocity >= 1.0 ? 'normal' : 'slow',
    };
  } catch (error) {
    logger.error(`getLearningVelocityAnalysis error: ${error.message}`);
    throw error;
  }
};

/**
 * Yıllık aktivite verisi (heatmap için)
 * Son 365 gün, her gün için çalışma süresi
 */
const getYearlyActivity = async (userId) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: oneYearAgo },
      },
      select: {
        date: true,
        duration: true,
      },
    });

    // Günlük toplamlar
    const dailyMap = {};
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = 0;
      }
      dailyMap[dateKey] += session.duration;
    });

    // 365 günlük array oluştur (boş günler 0)
    const yearData = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      yearData.push({
        date: dateKey,
        duration: dailyMap[dateKey] || 0,
        dayOfWeek: date.getDay(), // 0-6 (Sunday-Saturday)
        week: Math.floor(i / 7),
      });
    }

    return yearData;
  } catch (error) {
    logger.error(`getYearlyActivity error: ${error.message}`);
    throw error;
  }
};

/**
 * Son 6 aylık trend (aylık özet)
 */
const getSixMonthTrend = async (userId) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      select: {
        date: true,
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        questionsEmpty: true,
      },
    });

    // Aylık gruplama
    const monthlyMap = {};
    sessions.forEach(session => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          duration: 0,
          sessions: 0,
          correct: 0,
          wrong: 0,
          empty: 0,
        };
      }
      
      monthlyMap[monthKey].duration += session.duration;
      monthlyMap[monthKey].sessions += 1;
      monthlyMap[monthKey].correct += session.questionsCorrect;
      monthlyMap[monthKey].wrong += session.questionsWrong;
      monthlyMap[monthKey].empty += session.questionsEmpty;
    });

    // Son 6 ay array'i oluştur (boş aylar 0)
    const trendData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const data = monthlyMap[monthKey] || {
        month: monthKey,
        duration: 0,
        sessions: 0,
        correct: 0,
        wrong: 0,
        empty: 0,
      };

      const totalQuestions = data.correct + data.wrong + data.empty;
      const successRate = totalQuestions > 0 ? (data.correct / totalQuestions) * 100 : 0;

      trendData.push({
        month: monthKey,
        monthName: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
        duration: data.duration,
        durationHours: Math.round((data.duration / 60) * 10) / 10,
        sessions: data.sessions,
        totalQuestions,
        successRate: Math.round(successRate * 10) / 10,
      });
    }

    return trendData;
  } catch (error) {
    logger.error(`getSixMonthTrend error: ${error.message}`);
    throw error;
  }
};

/**
 * Ders detaylı analiz (Dersler tab'ı için)
 */
const getSubjectDetailedAnalysis = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true },
    });

    // Kullanıcının erişebileceği tüm dersleri al
    const subjectService = require('./subject.service');
    const allSubjects = await prisma.subject.findMany({
      include: {
        topics: true,
      },
    });

    const accessibleSubjects = allSubjects.filter(subject =>
      subjectService.checkSubjectAccess(user.examType, subject, 'USER')
    );

    // Her ders için detaylı analiz
    const detailedAnalysis = await Promise.all(
      accessibleSubjects.map(async (subject) => {
        // Çalışma istatistikleri
        const stats = await prisma.studySession.aggregate({
          where: {
            userId,
            subjectId: subject.id,
          },
          _sum: {
            duration: true,
            questionsCorrect: true,
            questionsWrong: true,
            questionsEmpty: true,
          },
          _count: true,
        });

        // Son çalışma tarihi
        const lastSession = await prisma.studySession.findFirst({
          where: {
            userId,
            subjectId: subject.id,
          },
          orderBy: { date: 'desc' },
          select: { date: true },
        });

        // Konu tamamlanma durumu
        const totalTopics = subject.topics.length;
        const studiedTopics = await prisma.studySession.groupBy({
          by: ['topicId'],
          where: {
            userId,
            subjectId: subject.id,
            topicId: { not: null },
          },
        });

        const studiedTopicCount = studiedTopics.length;
        const topicCompletionRate = totalTopics > 0 
          ? (studiedTopicCount / totalTopics) * 100 
          : 0;

        // Toplam sorular
        const totalQuestions = 
          (stats._sum.questionsCorrect || 0) +
          (stats._sum.questionsWrong || 0) +
          (stats._sum.questionsEmpty || 0);

        const successRate = totalQuestions > 0
          ? ((stats._sum.questionsCorrect || 0) / totalQuestions) * 100
          : 0;

        // Net hesaplama
        const net = (stats._sum.questionsCorrect || 0) - 
                    ((stats._sum.questionsWrong || 0) / 4);

        // Durum belirleme (yetersiz/orta/iyi)
        let status = 'insufficient'; // yetersiz
        if (topicCompletionRate >= 70 && successRate >= 70) {
          status = 'good';
        } else if (topicCompletionRate >= 50 || successRate >= 50) {
          status = 'medium';
        }

        return {
          subject: {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            color: subject.color,
            examType: subject.examType,
          },
          stats: {
            totalSessions: stats._count,
            totalDuration: stats._sum.duration || 0,
            totalDurationHours: Math.round(((stats._sum.duration || 0) / 60) * 10) / 10,
            totalQuestions,
            correctQuestions: stats._sum.questionsCorrect || 0,
            wrongQuestions: stats._sum.questionsWrong || 0,
            emptyQuestions: stats._sum.questionsEmpty || 0,
            successRate: Math.round(successRate * 10) / 10,
            net: Math.round(net * 100) / 100,
          },
          topics: {
            total: totalTopics,
            studied: studiedTopicCount,
            unstudied: totalTopics - studiedTopicCount,
            completionRate: Math.round(topicCompletionRate * 10) / 10,
          },
          lastStudyDate: lastSession ? lastSession.date : null,
          status, // insufficient, medium, good
        };
      })
    );

    // Durum gruplarına göre say
    const statusCounts = {
      insufficient: detailedAnalysis.filter(s => s.status === 'insufficient').length,
      medium: detailedAnalysis.filter(s => s.status === 'medium').length,
      good: detailedAnalysis.filter(s => s.status === 'good').length,
    };

    return {
      subjects: detailedAnalysis,
      summary: {
        totalSubjects: detailedAnalysis.length,
        studiedSubjects: detailedAnalysis.filter(s => s.stats.totalSessions > 0).length,
        unstudiedSubjects: detailedAnalysis.filter(s => s.stats.totalSessions === 0).length,
        statusCounts,
      },
    };
  } catch (error) {
    logger.error(`getSubjectDetailedAnalysis error: ${error.message}`);
    throw error;
  }
};

/**
 * Konu detaylı analiz (Konular tab'ı için)
 */
const getTopicDetailedAnalysis = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true },
    });

    // Kullanıcının erişebileceği tüm konuları al
    const subjectService = require('./subject.service');
    const allSubjects = await prisma.subject.findMany({
      include: {
        topics: true,
      },
    });

    const accessibleSubjects = allSubjects.filter(subject =>
      subjectService.checkSubjectAccess(user.examType, subject, 'USER')
    );

    const allTopics = accessibleSubjects.flatMap(subject =>
      subject.topics.map(topic => ({ ...topic, subject }))
    );

    // Her konu için detaylı analiz
    const topicAnalysis = await Promise.all(
      allTopics.map(async (topic) => {
        // Çalışma istatistikleri
        const stats = await prisma.studySession.aggregate({
          where: {
            userId,
            topicId: topic.id,
          },
          _sum: {
            duration: true,
            questionsCorrect: true,
            questionsWrong: true,
            questionsEmpty: true,
          },
          _count: true,
        });

        // Son çalışma tarihi
        const lastSession = await prisma.studySession.findFirst({
          where: {
            userId,
            topicId: topic.id,
          },
          orderBy: { date: 'desc' },
          select: { date: true },
        });

        // Spaced repetition durumu
        const spacedRep = await prisma.userTopicSpacedRepetition.findUnique({
          where: {
            userId_topicId: {
              userId,
              topicId: topic.id,
            },
          },
        });

        const totalQuestions =
          (stats._sum.questionsCorrect || 0) +
          (stats._sum.questionsWrong || 0) +
          (stats._sum.questionsEmpty || 0);

        const successRate = totalQuestions > 0
          ? ((stats._sum.questionsCorrect || 0) / totalQuestions) * 100
          : 0;

        // Kategori belirleme
        let category = 'unstudied'; // hiç çalışılmamış
        if (stats._count > 0) {
          if (successRate >= 80) {
            category = 'strong'; // güçlü
          } else if (successRate < 60) {
            category = 'weak'; // zayıf
          } else {
            category = 'medium'; // orta
          }
        }

        // Tekrar durumu
        const now = new Date();
        const needsReview = spacedRep && spacedRep.nextReviewAt <= now;
        const isOverdue = spacedRep && spacedRep.nextReviewAt < now;
        const daysOverdue = isOverdue
          ? Math.floor((now - spacedRep.nextReviewAt) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          topic: {
            id: topic.id,
            name: topic.name,
            code: topic.code,
            difficultyLevel: topic.difficultyLevel,
          },
          subject: {
            id: topic.subject.id,
            name: topic.subject.name,
            code: topic.subject.code,
            color: topic.subject.color,
          },
          stats: {
            totalSessions: stats._count,
            totalDuration: stats._sum.duration || 0,
            totalQuestions,
            correctQuestions: stats._sum.questionsCorrect || 0,
            wrongQuestions: stats._sum.questionsWrong || 0,
            emptyQuestions: stats._sum.questionsEmpty || 0,
            successRate: Math.round(successRate * 10) / 10,
          },
          spacedRepetition: spacedRep ? {
            lastStudiedAt: spacedRep.lastStudiedAt,
            nextReviewAt: spacedRep.nextReviewAt,
            repetitionLevel: spacedRep.repetitionLevel,
            consecutiveCorrect: spacedRep.consecutiveCorrect,
            masteryPercentage: (spacedRep.repetitionLevel / 5) * 100,
            needsReview,
            isOverdue,
            daysOverdue,
          } : null,
          lastStudyDate: lastSession ? lastSession.date : null,
          category, // unstudied, weak, medium, strong
        };
      })
    );

    // Kategorilere göre grupla
    const categorized = {
      unstudied: topicAnalysis.filter(t => t.category === 'unstudied'),
      weak: topicAnalysis.filter(t => t.category === 'weak'),
      medium: topicAnalysis.filter(t => t.category === 'medium'),
      strong: topicAnalysis.filter(t => t.category === 'strong'),
    };

    // Tekrar gereken konular
    const dueForReview = topicAnalysis.filter(t => t.spacedRepetition?.needsReview);
    const overdue = topicAnalysis.filter(t => t.spacedRepetition?.isOverdue);

    // Mastery levels
    const masteryLevels = {
      level0: topicAnalysis.filter(t => !t.spacedRepetition || t.spacedRepetition.repetitionLevel === 0).length,
      level1: topicAnalysis.filter(t => t.spacedRepetition?.repetitionLevel === 1).length,
      level2: topicAnalysis.filter(t => t.spacedRepetition?.repetitionLevel === 2).length,
      level3: topicAnalysis.filter(t => t.spacedRepetition?.repetitionLevel === 3).length,
      level4: topicAnalysis.filter(t => t.spacedRepetition?.repetitionLevel === 4).length,
      level5: topicAnalysis.filter(t => t.spacedRepetition?.repetitionLevel === 5).length,
    };

    return {
      topics: topicAnalysis,
      categorized,
      dueForReview,
      overdue,
      summary: {
        totalTopics: allTopics.length,
        studiedTopics: topicAnalysis.filter(t => t.stats.totalSessions > 0).length,
        unstudiedTopics: categorized.unstudied.length,
        weakTopics: categorized.weak.length,
        strongTopics: categorized.strong.length,
        dueForReviewCount: dueForReview.length,
        overdueCount: overdue.length,
        masteryLevels,
      },
    };
  } catch (error) {
    logger.error(`getTopicDetailedAnalysis error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getSummaryStats,
  getDailyStats,
  getWeeklyComparison,
  getMonthlyComparison,
  getSubjectBreakdown,
  getStreakData,
  getRecords,
  getSuccessRateTrend,
  getPreparationProgress,
  getLearningVelocityAnalysis,
  getYearlyActivity,
  getSixMonthTrend,
  getSubjectDetailedAnalysis,
  getTopicDetailedAnalysis,
};