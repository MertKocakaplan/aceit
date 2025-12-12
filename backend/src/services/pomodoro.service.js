const prisma = require('../config/database');
const logger = require('../utils/logger');
const { getLocalDateString } = require('../utils/dateUtils');

/**
 * Tamamlanan pomodoro'yu kaydet
 */
const savePomodoroSession = async (userId, sessionData) => {
  try {
    const session = await prisma.pomodoroSession.create({
      data: {
        userId,
        duration: sessionData.duration,
        mode: sessionData.mode,
        subjectId: sessionData.subjectId || null,
        isCompleted: true,
      },
    });

    return session;
  } catch (error) {
    logger.error(`savePomodoroSession error: ${error.message}`);
    throw error;
  }
};

/**
 * Kullanıcının pomodoro istatistiklerini getir
 */
const getUserPomodoroStats = async (userId, filters = {}) => {
  try {
    const where = { userId, isCompleted: true };

    // Tarih filtreleme - UTC timezone sorunlarını önlemek için düzgün tarih oluşturma
    if (filters.startDate || filters.endDate) {
      where.date = {};

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        where.date.gte = startDate;
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const stats = await prisma.pomodoroSession.aggregate({
      where,
      _count: true,
      _sum: {
        duration: true,
      },
    });

    const workSessions = await prisma.pomodoroSession.count({
      where: { ...where, mode: 'work' },
    });

    return {
      totalSessions: stats._count || 0,
      totalDuration: stats._sum.duration || 0,
      workSessions: workSessions || 0,
      breakSessions: (stats._count || 0) - (workSessions || 0),
    };
  } catch (error) {
    logger.error(`getUserPomodoroStats error: ${error.message}`);
    throw error;
  }
};

/**
 * Pomodoro istatistikleri (Stats sayfası için)
 */
const getPomodoroStats = async (userId) => {
  try {
    // Toplam pomodoro
    const totalPomodoros = await prisma.pomodoroSession.aggregate({
      where: { userId, isCompleted: true },
      _sum: { duration: true },
      _count: true,
    });

    // Son 7 günlük pomodoro
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyPomodoros = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        isCompleted: true,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Günlük gruplama (local timezone)
    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateKey = getLocalDateString(date);
      dailyMap[dateKey] = {
        date: dateKey,
        count: 0,
        duration: 0,
      };
    }

    weeklyPomodoros.forEach((session) => {
      const dateKey = getLocalDateString(new Date(session.date));
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].count += 1;
        dailyMap[dateKey].duration += session.duration;
      }
    });

    const dailyData = Object.values(dailyMap);

    // Haftalık trend (son 4 hafta)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const monthlyPomodoros = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        isCompleted: true,
        date: { gte: fourWeeksAgo },
      },
    });

    // Haftalık gruplama
    const weeklyMap = {};
    monthlyPomodoros.forEach((session) => {
      const date = new Date(session.date);
      const weekStart = new Date(date);
      const dayOfWeek = date.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(date.getDate() + daysToMonday);
      weekStart.setHours(0, 0, 0, 0);

      const weekKey = getLocalDateString(weekStart);
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          week: weekKey,
          count: 0,
          duration: 0,
        };
      }
      weeklyMap[weekKey].count += 1;
      weeklyMap[weekKey].duration += session.duration;
    });

    const weeklyTrend = Object.values(weeklyMap).sort((a, b) => 
      new Date(a.week) - new Date(b.week)
    );

    // En üretken saatler (24 saat)
    const allPomodoros = await prisma.pomodoroSession.findMany({
      where: { userId, isCompleted: true },
      select: { date: true },
    });

    const hourlyMap = Array(24).fill(0);
    allPomodoros.forEach((session) => {
      const hour = new Date(session.date).getHours();
      hourlyMap[hour] += 1;
    });

    const productiveHours = hourlyMap
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Ortalama günlük pomodoro (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const last30Days = await prisma.pomodoroSession.groupBy({
      by: ['date'],
      where: {
        userId,
        isCompleted: true,
        date: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    const totalDays = last30Days.length || 1;
    const totalCount = last30Days.reduce((sum, day) => sum + day._count, 0);
    const averageDaily = Math.round((totalCount / totalDays) * 10) / 10;

    // Mode dağılımı (work, short_break, long_break)
    const modeDistribution = await prisma.pomodoroSession.groupBy({
      by: ['mode'],
      where: { userId, isCompleted: true },
      _count: true,
      _sum: { duration: true },
    });

    return {
      total: {
        count: totalPomodoros._count,
        duration: totalPomodoros._sum.duration || 0,
        durationHours: Math.round(((totalPomodoros._sum.duration || 0) / 60) * 10) / 10,
      },
      daily: dailyData,
      weeklyTrend,
      averageDaily,
      productiveHours,
      hourlyDistribution: hourlyMap,
      modeDistribution: modeDistribution.map(m => ({
        mode: m.mode,
        count: m._count,
        duration: m._sum.duration || 0,
      })),
    };
  } catch (error) {
    logger.error(`getPomodoroStats error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  savePomodoroSession,
  getUserPomodoroStats,
  getPomodoroStats,
};