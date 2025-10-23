const prisma = require('../config/database');
const logger = require('../utils/logger');

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

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0); // Günün başı
      
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Günün sonu
      
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      where.date = { gte: startDate };
    } else if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.date = { lte: endDate };
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

module.exports = {
  savePomodoroSession,
  getUserPomodoroStats,
};