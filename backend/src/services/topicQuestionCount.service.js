const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Belirli bir yıl için tüm konu-soru sayılarını getir
 */
const getByExamYear = async (examYearId) => {
  try {
    const counts = await prisma.topicQuestionCount.findMany({
      where: { examYearId },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [
        { topic: { subject: { name: 'asc' } } },
        { topic: { order: 'asc' } },
      ],
    });

    return counts;
  } catch (error) {
    logger.error(`getByExamYear error: ${error.message}`);
    throw error;
  }
};

/**
 * Belirli bir konu için tüm yıllardaki soru sayılarını getir
 */
const getByTopic = async (topicId) => {
  try {
    const counts = await prisma.topicQuestionCount.findMany({
      where: { topicId },
      include: {
        examYear: true,
      },
      orderBy: { examYear: { year: 'desc' } },
    });

    return counts;
  } catch (error) {
    logger.error(`getByTopic error: ${error.message}`);
    throw error;
  }
};

/**
 * Konu-soru sayısı oluştur veya güncelle (bulk)
 */
const upsertBulk = async (examYearId, data) => {
  try {
    // data: [{ topicId, questionCount }, ...]
    
    const operations = data.map((item) =>
      prisma.topicQuestionCount.upsert({
        where: {
          topicId_examYearId: {
            topicId: item.topicId,
            examYearId: examYearId,
          },
        },
        update: {
          questionCount: item.questionCount,
        },
        create: {
          topicId: item.topicId,
          examYearId: examYearId,
          questionCount: item.questionCount,
        },
      })
    );

    await prisma.$transaction(operations);

    // Konuların ortalamasını güncelle
    await updateTopicAverages(data.map((item) => item.topicId));

    logger.info(`TopicQuestionCount bulk upsert: ${data.length} kayıt`);
    return { message: 'Soru sayıları güncellendi', count: data.length };
  } catch (error) {
    logger.error(`upsertBulk error: ${error.message}`);
    throw error;
  }
};

/**
 * Tek kayıt oluştur/güncelle
 */
const upsert = async (topicId, examYearId, questionCount) => {
  try {
    const count = await prisma.topicQuestionCount.upsert({
      where: {
        topicId_examYearId: {
          topicId,
          examYearId,
        },
      },
      update: {
        questionCount,
      },
      create: {
        topicId,
        examYearId,
        questionCount,
      },
      include: {
        topic: true,
        examYear: true,
      },
    });

    // Konunun ortalamasını güncelle
    await updateTopicAverages([topicId]);

    logger.info(`TopicQuestionCount upsert: ${topicId} - ${examYearId}`);
    return count;
  } catch (error) {
    logger.error(`upsert error: ${error.message}`);
    throw error;
  }
};

/**
 * Sil
 */
const deleteCount = async (id) => {
  try {
    const count = await prisma.topicQuestionCount.findUnique({
      where: { id },
      select: { topicId: true },
    });

    await prisma.topicQuestionCount.delete({
      where: { id },
    });

    // Konunun ortalamasını güncelle
    if (count) {
      await updateTopicAverages([count.topicId]);
    }

    logger.info(`TopicQuestionCount silindi: ${id}`);
    return { message: 'Soru sayısı silindi' };
  } catch (error) {
    logger.error(`deleteCount error: ${error.message}`);
    throw error;
  }
};

/**
 * Konuların ortalama soru sayısını ve önem puanını güncelle
 */
const updateTopicAverages = async (topicIds) => {
  try {
    for (const topicId of topicIds) {
      // Son 3-5 yıl ortalaması al
      const stats = await prisma.topicQuestionCount.aggregate({
        where: { topicId },
        _avg: {
          questionCount: true,
        },
      });

      const averageQuestions = stats._avg.questionCount || 0;

      // Konuyu güncelle
      await prisma.topic.update({
        where: { id: topicId },
        data: {
          averageQuestions: Math.round(averageQuestions * 10) / 10, // 1 ondalık
          importanceScore: null, // Şimdilik null, öneri algoritması hesaplayacak
        },
      });
    }

    logger.info(`Topic averages updated: ${topicIds.length} konu`);
  } catch (error) {
    logger.error(`updateTopicAverages error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getByExamYear,
  getByTopic,
  upsertBulk,
  upsert,
  deleteCount,
  updateTopicAverages,
};