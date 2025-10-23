const prisma = require('../config/database');
const logger = require('../utils/logger');
const { checkSubjectAccess } = require('./subject.service');

/**
 * Yeni çalışma kaydı oluştur
 */
const createStudySession = async (userId, sessionData) => {
  try {
    // Kullanıcı ve ders bilgisi al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true },
    });

    const subject = await prisma.subject.findUnique({
      where: { id: sessionData.subjectId },
    });

    if (!subject) {
      throw new Error('Ders bulunamadı');
    }

    // Ders erişim kontrolü
    const canAccess = checkSubjectAccess(user.examType, subject);
    if (!canAccess) {
      throw new Error('Bu ders sizin sınav türünüze uygun değil');
    }

    // TopicId kontrol
    if (sessionData.topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: sessionData.topicId },
      });

      if (!topic || topic.subjectId !== sessionData.subjectId) {
        throw new Error('Konu bu derse ait değil');
      }
    }

    // Çalışma kaydı oluştur
    const studySession = await prisma.studySession.create({
      data: {
        userId,
        subjectId: sessionData.subjectId,
        topicId: sessionData.topicId || null,
        date: sessionData.date || new Date(),
        duration: sessionData.duration,
        questionsCorrect: sessionData.questionsCorrect || 0,
        questionsWrong: sessionData.questionsWrong || 0,
        questionsEmpty: sessionData.questionsEmpty || 0,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Yeni çalışma kaydı oluşturuldu: ${studySession.id}`);
    return studySession;
  } catch (error) {
    logger.error(`createStudySession error: ${error.message}`);
    throw error;
  }
};

/**
 * Kullanıcının çalışma kayıtlarını getir
 */
const getUserStudySessions = async (userId, filters = {}) => {
  try {
    const { subjectId, startDate, endDate, limit = 50, page = 1 } = filters;

    const where = { userId };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [studySessions, totalCount] = await Promise.all([
      prisma.studySession.findMany({
        where,
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit),
        skip: skip,
      }),
      prisma.studySession.count({ where }),
    ]);

    return {
      studySessions,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error(`getUserStudySessions error: ${error.message}`);
    throw error;
  }
};

/**
 * Tek bir çalışma kaydını getir
 */
const getStudySessionById = async (sessionId, userId) => {
  try {
    const studySession = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!studySession) {
      throw new Error('Çalışma kaydı bulunamadı');
    }

    return studySession;
  } catch (error) {
    logger.error(`getStudySessionById error: ${error.message}`);
    throw error;
  }
};

/**
 * Çalışma kaydını güncelle
 */
const updateStudySession = async (sessionId, userId, updateData) => {
  try {
    const existingSession = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!existingSession) {
      throw new Error('Çalışma kaydı bulunamadı');
    }

    // SubjectId değişiyorsa kontrol et
    if (updateData.subjectId && updateData.subjectId !== existingSession.subjectId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { examType: true },
      });

      const subject = await prisma.subject.findUnique({
        where: { id: updateData.subjectId },
      });

      if (!subject) {
        throw new Error('Ders bulunamadı');
      }

      // Ders erişim kontrolü
      const canAccess = checkSubjectAccess(user.examType, subject);
      if (!canAccess) {
        throw new Error('Bu ders sizin sınav türünüze uygun değil');
      }
    }

    // Güncelle
    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Çalışma kaydı güncellendi: ${sessionId}`);
    return updatedSession;
  } catch (error) {
    logger.error(`updateStudySession error: ${error.message}`);
    throw error;
  }
};

/**
 * Çalışma kaydını sil
 */
const deleteStudySession = async (sessionId, userId) => {
  try {
    const existingSession = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!existingSession) {
      throw new Error('Çalışma kaydı bulunamadı');
    }

    await prisma.studySession.delete({
      where: { id: sessionId },
    });

    logger.info(`Çalışma kaydı silindi: ${sessionId}`);
    return { message: 'Çalışma kaydı başarıyla silindi' };
  } catch (error) {
    logger.error(`deleteStudySession error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createStudySession,
  getUserStudySessions,
  getStudySessionById,
  updateStudySession,
  deleteStudySession,
};