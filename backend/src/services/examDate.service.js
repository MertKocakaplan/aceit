const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Kullanıcı için geçerli sınav tarihini al
 * Öncelik: User.targetDate > ExamYear.examDate
 *
 * @param {string} userId - Kullanıcı ID
 * @returns {Object} { examDate, daysRemaining, source }
 */
async function getEffectiveExamDate(userId) {
  try {
    // 1. Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        targetDate: true,
        examType: true
      }
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // 2. Aktif ExamYear'ı al (resmi sınav tarihi)
    const activeExamYear = await prisma.examYear.findFirst({
      where: { isActive: true },
      select: {
        examDate: true,
        year: true
      }
    });

    // 3. Geçerli tarihi belirle
    let examDate = null;
    let source = 'none';

    // Önce user.targetDate kontrol et
    if (user.targetDate) {
      examDate = new Date(user.targetDate);
      source = 'user';
    }
    // Sonra ExamYear.examDate kontrol et
    else if (activeExamYear?.examDate) {
      examDate = new Date(activeExamYear.examDate);
      source = 'examYear';
    }

    // 4. Kalan günleri hesapla
    let daysRemaining = null;
    if (examDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      examDate.setHours(0, 0, 0, 0);

      const diffMs = examDate - now;
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    return {
      examDate,
      daysRemaining,
      source, // 'user' | 'examYear' | 'none'
      examType: user.examType,
      examYear: activeExamYear?.year || null
    };
  } catch (error) {
    logger.error(`getEffectiveExamDate error: ${error.message}`);
    throw error;
  }
}

/**
 * Sınava kalan süreyi insan okunur formatta döndür
 * @param {number} daysRemaining
 * @returns {string}
 */
function formatRemainingTime(daysRemaining) {
  if (daysRemaining === null) {
    return 'Belirtilmemiş';
  }

  if (daysRemaining < 0) {
    return 'Sınav tarihi geçti';
  }

  if (daysRemaining === 0) {
    return 'Bugün!';
  }

  if (daysRemaining === 1) {
    return 'Yarın!';
  }

  if (daysRemaining <= 7) {
    return `${daysRemaining} gün (Bu hafta!)`;
  }

  if (daysRemaining <= 30) {
    const weeks = Math.floor(daysRemaining / 7);
    const days = daysRemaining % 7;
    return `${weeks} hafta ${days > 0 ? `${days} gün` : ''}`;
  }

  const months = Math.floor(daysRemaining / 30);
  const remainingDays = daysRemaining % 30;

  if (months < 12) {
    return `${months} ay ${remainingDays > 0 ? `${remainingDays} gün` : ''}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} yıl ${remainingMonths > 0 ? `${remainingMonths} ay` : ''}`;
}

/**
 * Sınav tarihi aciliyetine göre öncelik seviyesi
 * @param {number} daysRemaining
 * @returns {string} 'critical' | 'urgent' | 'moderate' | 'relaxed' | 'unknown'
 */
function getUrgencyLevel(daysRemaining) {
  if (daysRemaining === null) return 'unknown';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'urgent';
  if (daysRemaining <= 90) return 'moderate';
  return 'relaxed';
}

module.exports = {
  getEffectiveExamDate,
  formatRemainingTime,
  getUrgencyLevel
};
