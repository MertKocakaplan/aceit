const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Ders erişim kontrolü helper fonksiyonu
 */
const checkSubjectAccess = (userExamType, subjectExamType) => {
  // TYT herkese açık
  if (subjectExamType === 'TYT') return true;

  // LGS kullanıcısı sadece LGS
  if (userExamType === 'LGS') return subjectExamType === 'LGS';

  // AYT derslerini kontrol et
  const aytAccessMap = {
    'YKS_SAYISAL': ['AYT_MATEMATIK', 'AYT_FIZIK', 'AYT_KIMYA', 'AYT_BIYOLOJI'],
    'YKS_ESIT_AGIRLIK': ['AYT_MATEMATIK', 'AYT_EDEBIYAT', 'AYT_TARIH', 'AYT_COGRAFYA'],
    'YKS_SOZEL': ['AYT_EDEBIYAT', 'AYT_TARIH', 'AYT_COGRAFYA', 'AYT_FELSEFE', 'AYT_DIN'],
  };

  return aytAccessMap[userExamType]?.includes(subjectExamType) || false;
};

/**
 * Kullanıcının erişebileceği tüm dersleri getir
 */
const getUserSubjects = async (userId) => {
  try {
    // Kullanıcının sınav türünü al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Tüm dersleri getir
    const allSubjects = await prisma.subject.findMany({
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

    // Kullanıcının erişebileceği dersleri filtrele
    const accessibleSubjects = allSubjects.filter(subject =>
      checkSubjectAccess(user.examType, subject.examType)
    );

    // Her ders için kullanıcının istatistiklerini ekle
    const subjectsWithStats = await Promise.all(
      accessibleSubjects.map(async (subject) => {
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

    // userId verilmişse, kullanıcının istatistiklerini ekle
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
 */
const getSubjectTopics = async (subjectId, userId = null) => {
  try {
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

    // userId verilmişse istatistikleri ekle
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
  getUserSubjects,
  getSubjectById,
  getSubjectTopics,
  checkSubjectAccess, // Export helper
};