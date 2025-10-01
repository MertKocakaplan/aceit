const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Kullanıcının sınav türüne göre dersleri getir
 * @param {String} examType - Kullanıcının sınav türü (LGS, YKS_SAYISAL, vb.)
 * @returns {Array} Dersler listesi
 */
const getSubjectsByExamType = async (examType) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { examType },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            studySessions: true,
            topics: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return subjects;
  } catch (error) {
    logger.error(`getSubjectsByExamType error: ${error.message}`);
    throw error;
  }
};

/**
 * Kullanıcının çalıştığı dersleri getir (study session olanlar)
 * @param {String} userId - Kullanıcı ID
 * @returns {Array} Çalışılan dersler
 */
const getUserSubjects = async (userId) => {
  try {
    // Önce kullanıcının sınav türünü al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Kullanıcının sınav türüne göre dersleri getir
    const subjects = await getSubjectsByExamType(user.examType);

    // Her ders için kullanıcının çalışma istatistiklerini ekle
    const subjectsWithStats = await Promise.all(
      subjects.map(async (subject) => {
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

        return {
          ...subject,
          userStats: {
            totalSessions: stats._count,
            totalDuration: stats._sum.duration || 0,
            totalCorrect: stats._sum.questionsCorrect || 0,
            totalWrong: stats._sum.questionsWrong || 0,
            totalEmpty: stats._sum.questionsEmpty || 0,
            totalQuestions:
              (stats._sum.questionsCorrect || 0) +
              (stats._sum.questionsWrong || 0) +
              (stats._sum.questionsEmpty || 0),
          },
        };
      })
    );

    return subjectsWithStats;
  } catch (error) {
    logger.error(`getUserSubjects error: ${error.message}`);
    throw error;
  }
};

/**
 * Ders detayını getir
 * @param {String} subjectId - Ders ID
 * @param {String} userId - Kullanıcı ID (optional, stats için)
 * @returns {Object} Ders detayı
 */
const getSubjectById = async (subjectId, userId = null) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!subject) {
      throw new Error('Ders bulunamadı');
    }

    // Eğer userId verilmişse, kullanıcının bu dersteki istatistiklerini ekle
    if (userId) {
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

      subject.userStats = {
        totalSessions: stats._count,
        totalDuration: stats._sum.duration || 0,
        totalCorrect: stats._sum.questionsCorrect || 0,
        totalWrong: stats._sum.questionsWrong || 0,
        totalEmpty: stats._sum.questionsEmpty || 0,
        totalQuestions:
          (stats._sum.questionsCorrect || 0) +
          (stats._sum.questionsWrong || 0) +
          (stats._sum.questionsEmpty || 0),
        lastStudyDate: lastSession ? lastSession.date : null,
      };
    }

    return subject;
  } catch (error) {
    logger.error(`getSubjectById error: ${error.message}`);
    throw error;
  }
};

/**
 * Dersin konularını getir
 * @param {String} subjectId - Ders ID
 * @param {String} userId - Kullanıcı ID (optional, stats için)
 * @returns {Array} Konular listesi
 */
const getSubjectTopics = async (subjectId, userId = null) => {
  try {
    // Önce dersin var olduğunu kontrol et
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new Error('Ders bulunamadı');
    }

    const topics = await prisma.topic.findMany({
      where: { subjectId },
      orderBy: { order: 'asc' },
    });

    // Eğer userId verilmişse, her konu için çalışma istatistikleri ekle
    if (userId) {
      const topicsWithStats = await Promise.all(
        topics.map(async (topic) => {
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

          return {
            ...topic,
            userStats: {
              totalSessions: stats._count,
              totalDuration: stats._sum.duration || 0,
              totalCorrect: stats._sum.questionsCorrect || 0,
              totalWrong: stats._sum.questionsWrong || 0,
              totalEmpty: stats._sum.questionsEmpty || 0,
            },
          };
        })
      );

      return topicsWithStats;
    }

    return topics;
  } catch (error) {
    logger.error(`getSubjectTopics error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getSubjectsByExamType,
  getUserSubjects,
  getSubjectById,
  getSubjectTopics,
};