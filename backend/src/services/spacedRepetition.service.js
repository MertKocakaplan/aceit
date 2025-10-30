const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Unutma eğrisi tekrar aralıkları (gün cinsinden)
 * Bilimsel araştırmalara dayalı optimal tekrar sıklığı
 */
const REPETITION_INTERVALS = [
  1,  // 1. tekrar: 1 gün sonra
  3,  // 2. tekrar: 3 gün sonra
  7,  // 3. tekrar: 7 gün sonra
  14, // 4. tekrar: 14 gün sonra
  30, // 5. tekrar: 30 gün sonra
];

/**
 * Konu çalışıldığında spaced repetition kaydını güncelle
 * @param {string} userId - Kullanıcı ID
 * @param {string} topicId - Konu ID
 * @param {number} performanceScore - Performans skoru (0-1 arası)
 * @returns {object} Güncellenen spaced repetition kaydı
 */
const updateTopicProgress = async (userId, topicId, performanceScore) => {
  try {
    const now = new Date();

    // Mevcut kaydı bul
    let record = await prisma.userTopicSpacedRepetition.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    if (!record) {
      // İlk kez çalışılıyor, yeni kayıt oluştur
      const nextReview = new Date(now);
      nextReview.setDate(now.getDate() + REPETITION_INTERVALS[0]);

      record = await prisma.userTopicSpacedRepetition.create({
        data: {
          userId,
          topicId,
          lastStudiedAt: now,
          nextReviewAt: nextReview,
          repetitionLevel: performanceScore >= 0.7 ? 1 : 0,
          consecutiveCorrect: performanceScore >= 0.7 ? 1 : 0,
          easinessFactor: calculateEasinessFactor(2.5, performanceScore),
        },
      });

      logger.info(`Created new spaced repetition for user ${userId}, topic ${topicId}`);
      return record;
    }

    // Mevcut kayıt var, güncelle
    const wasOnTime = now <= record.nextReviewAt;
    let newLevel = record.repetitionLevel;
    let newConsecutive = record.consecutiveCorrect;
    let newEasiness = record.easinessFactor;

    if (performanceScore >= 0.7) {
      // Başarılı çalışma
      if (wasOnTime) {
        // Zamanında çalıştı ve başarılı
        newLevel = Math.min(5, record.repetitionLevel + 1);
        newConsecutive = record.consecutiveCorrect + 1;
      } else {
        // Geç kaldı ama başarılı
        newLevel = Math.min(5, record.repetitionLevel + 1);
        newConsecutive = 1; // Reset consecutive
      }
    } else {
      // Başarısız çalışma - seviyeyi düşür
      newLevel = Math.max(0, record.repetitionLevel - 1);
      newConsecutive = 0;
    }

    // Easiness factor'ı güncelle (SM-2 algoritması)
    newEasiness = calculateEasinessFactor(record.easinessFactor, performanceScore);

    // Sonraki tekrar tarihini hesapla
    const interval = calculateNextInterval(newLevel, newEasiness);
    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + interval);

    // Güncelle
    const updated = await prisma.userTopicSpacedRepetition.update({
      where: { id: record.id },
      data: {
        lastStudiedAt: now,
        nextReviewAt: nextReview,
        repetitionLevel: newLevel,
        consecutiveCorrect: newConsecutive,
        easinessFactor: newEasiness,
      },
    });

    logger.info(
      `Updated spaced repetition for user ${userId}, topic ${topicId}: level ${newLevel}, next review in ${interval} days`
    );

    return updated;
  } catch (error) {
    logger.error(`updateTopicProgress error: ${error.message}`);
    throw error;
  }
};

/**
 * SM-2 algoritmasına göre easiness factor hesapla
 * @param {number} currentEF - Mevcut easiness factor
 * @param {number} performanceScore - Performans skoru (0-1)
 * @returns {number} Yeni easiness factor (1.3-2.5 arası)
 */
const calculateEasinessFactor = (currentEF, performanceScore) => {
  // Performans skorunu 0-5 skalasına çevir (SM-2 için)
  const quality = Math.round(performanceScore * 5);

  // SM-2 formülü: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // 1.3 ile 2.5 arasında sınırla
  return Math.max(1.3, Math.min(2.5, newEF));
};

/**
 * Sonraki tekrar aralığını hesapla
 * @param {number} level - Tekrar seviyesi (0-5)
 * @param {number} easinessFactor - Kolaylık faktörü
 * @returns {number} Gün cinsinden interval
 */
const calculateNextInterval = (level, easinessFactor) => {
  if (level === 0) return REPETITION_INTERVALS[0]; // 1 gün
  if (level === 1) return REPETITION_INTERVALS[1]; // 3 gün
  if (level === 2) return REPETITION_INTERVALS[2]; // 7 gün
  if (level === 3) return REPETITION_INTERVALS[3]; // 14 gün
  if (level >= 4) return REPETITION_INTERVALS[4]; // 30 gün

  // Özel hesaplama (easiness factor kullanarak)
  const baseInterval = REPETITION_INTERVALS[Math.min(level, REPETITION_INTERVALS.length - 1)];
  return Math.round(baseInterval * easinessFactor);
};

/**
 * Tekrar edilmesi gereken konuları getir
 * @param {string} userId - Kullanıcı ID
 * @param {number} limit - Maksimum konu sayısı
 * @returns {array} Tekrar edilmesi gereken konular
 */
const getTopicsDueForReview = async (userId, limit = 10) => {
  try {
    const now = new Date();

    const dueTopics = await prisma.userTopicSpacedRepetition.findMany({
      where: {
        userId,
        nextReviewAt: {
          lte: now,
        },
      },
      include: {
        topic: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: {
        nextReviewAt: 'asc', // En eskiler önce
      },
      take: limit,
    });

    return dueTopics.map((item) => ({
      ...item,
      daysSinceLastStudy: Math.floor((now - item.lastStudiedAt) / (1000 * 60 * 60 * 24)),
      daysOverdue: Math.floor((now - item.nextReviewAt) / (1000 * 60 * 60 * 24)),
    }));
  } catch (error) {
    logger.error(`getTopicsDueForReview error: ${error.message}`);
    throw error;
  }
};

/**
 * Kullanıcının tüm konu tekrar durumunu getir
 * @param {string} userId - Kullanıcı ID
 * @returns {object} Özet istatistikler
 */
const getUserSpacedRepetitionStats = async (userId) => {
  try {
    const now = new Date();

    // Tüm kayıtlar
    const all = await prisma.userTopicSpacedRepetition.count({
      where: { userId },
    });

    // Tekrar bekleyenler (zamanı gelmiş)
    const due = await prisma.userTopicSpacedRepetition.count({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
    });

    // Seviyeye göre dağılım
    const byLevel = await prisma.userTopicSpacedRepetition.groupBy({
      by: ['repetitionLevel'],
      where: { userId },
      _count: true,
    });

    // Bugün tekrar edilenler
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const reviewedToday = await prisma.userTopicSpacedRepetition.count({
      where: {
        userId,
        lastStudiedAt: { gte: todayStart },
      },
    });

    // Gelecek 7 gün içinde tekrarı gerekenler
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const upcomingReviews = await prisma.userTopicSpacedRepetition.count({
      where: {
        userId,
        nextReviewAt: {
          gt: now,
          lte: nextWeek,
        },
      },
    });

    return {
      totalTopics: all,
      dueForReview: due,
      reviewedToday,
      upcomingReviews,
      levelDistribution: byLevel.reduce((acc, item) => {
        acc[`level${item.repetitionLevel}`] = item._count;
        return acc;
      }, {}),
    };
  } catch (error) {
    logger.error(`getUserSpacedRepetitionStats error: ${error.message}`);
    throw error;
  }
};

/**
 * Konu için sonraki tekrar tarihini tahmin et
 * @param {string} userId - Kullanıcı ID
 * @param {string} topicId - Konu ID
 * @returns {object} Tahmin edilen bilgiler
 */
const getTopicReviewInfo = async (userId, topicId) => {
  try {
    const record = await prisma.userTopicSpacedRepetition.findUnique({
      where: {
        userId_topicId: { userId, topicId },
      },
      include: {
        topic: {
          select: {
            name: true,
            difficultyLevel: true,
          },
        },
      },
    });

    if (!record) {
      return {
        studied: false,
        message: 'Bu konu henüz çalışılmadı',
        recommendedAction: 'İlk çalışmayı yapın',
      };
    }

    const now = new Date();
    const isOverdue = now > record.nextReviewAt;
    const daysUntilReview = Math.ceil((record.nextReviewAt - now) / (1000 * 60 * 60 * 24));

    return {
      studied: true,
      lastStudiedAt: record.lastStudiedAt,
      nextReviewAt: record.nextReviewAt,
      repetitionLevel: record.repetitionLevel,
      consecutiveCorrect: record.consecutiveCorrect,
      isOverdue,
      daysUntilReview: isOverdue ? 0 : daysUntilReview,
      daysOverdue: isOverdue ? Math.abs(daysUntilReview) : 0,
      masteryPercentage: (record.repetitionLevel / 5) * 100,
      recommendedAction: isOverdue
        ? 'Tekrar zamanı geldi! Konuyu gözden geçirin.'
        : `${daysUntilReview} gün sonra tekrar edin.`,
    };
  } catch (error) {
    logger.error(`getTopicReviewInfo error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  updateTopicProgress,
  getTopicsDueForReview,
  getUserSpacedRepetitionStats,
  getTopicReviewInfo,
  REPETITION_INTERVALS,
};
