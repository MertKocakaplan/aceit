const prisma = require('../config/database');
const logger = require('../utils/logger');
const examDateService = require('./examDate.service');

/**
 * Günlük Rehberlik Servisi
 * Mevcut verileri kullanarak kısa ve öz günlük rehberlik oluşturur
 */

/**
 * Kullanıcının günlük rehberliğini oluştur
 * @param {string} userId
 * @returns {Object} { guidance, todayPlan, stats }
 */
async function getDailyGuidance(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Aktif çalışma planını ve bugünkü slotları al
    const activePlan = await prisma.studyPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        days: {
          where: {
            date: {
              gte: today,
              lt: tomorrow
            }
          },
          include: {
            slots: {
              include: {
                subject: { select: { name: true, color: true } },
                topic: { select: { name: true } }
              },
              orderBy: { startTime: 'asc' }
            }
          }
        }
      }
    });

    // 2. Bugünkü slotları çıkar
    const todaySlots = activePlan?.days[0]?.slots || [];
    const completedSlots = todaySlots.filter(s => s.isCompleted);
    const pendingSlots = todaySlots.filter(s => !s.isCompleted);

    // 3. Son 7 günlük çalışma istatistiklerini al
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo }
      },
      select: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
        date: true
      }
    });

    // 4. Dün çalışıldı mı?
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaySessions = recentSessions.filter(s => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === yesterday.getTime();
    });
    const studiedYesterday = yesterdaySessions.length > 0;
    const yesterdayMinutes = yesterdaySessions.reduce((sum, s) => sum + s.duration, 0);

    // 5. Streak hesapla (basit)
    const uniqueDays = new Set();
    recentSessions.forEach(s => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      uniqueDays.add(d.getTime());
    });
    const daysStudied = uniqueDays.size;

    // 6. Haftalık başarı oranı
    const totalCorrect = recentSessions.reduce((sum, s) => sum + s.questionsCorrect, 0);
    const totalWrong = recentSessions.reduce((sum, s) => sum + s.questionsWrong, 0);
    const weeklySuccessRate = totalCorrect + totalWrong > 0
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
      : null;

    // 7. Sınav tarihi bilgisi
    const examInfo = await examDateService.getEffectiveExamDate(userId);

    // 8. Rehberlik mesajı oluştur
    const guidance = generateGuidanceMessage({
      todaySlots,
      completedSlots,
      pendingSlots,
      studiedYesterday,
      yesterdayMinutes,
      daysStudied,
      weeklySuccessRate,
      examInfo
    });

    return {
      guidance,
      todayPlan: {
        hasActivePlan: !!activePlan,
        totalSlots: todaySlots.length,
        completedSlots: completedSlots.length,
        pendingSlots: pendingSlots.length,
        slots: todaySlots.map(s => ({
          id: s.id,
          subject: s.subject?.name,
          subjectColor: s.subject?.color,
          topic: s.topic?.name,
          startTime: s.startTime,
          endTime: s.endTime,
          duration: s.duration,
          isCompleted: s.isCompleted
        }))
      },
      stats: {
        studiedYesterday,
        yesterdayMinutes,
        daysStudiedThisWeek: daysStudied,
        weeklySuccessRate
      },
      examInfo: examInfo.daysRemaining !== null ? {
        daysRemaining: examInfo.daysRemaining,
        urgencyLevel: examDateService.getUrgencyLevel(examInfo.daysRemaining),
        formattedRemaining: examDateService.formatRemainingTime(examInfo.daysRemaining)
      } : null
    };
  } catch (error) {
    logger.error(`getDailyGuidance error: ${error.message}`);
    throw error;
  }
}

/**
 * Rehberlik mesajını oluştur (2-3 cümle)
 */
function generateGuidanceMessage(data) {
  const {
    todaySlots,
    completedSlots,
    pendingSlots,
    studiedYesterday,
    yesterdayMinutes,
    daysStudied,
    weeklySuccessRate,
    examInfo
  } = data;

  const messages = [];

  // 1. Bugünkü plan durumu
  if (todaySlots.length > 0) {
    if (completedSlots.length === todaySlots.length) {
      messages.push("Bugünkü tüm çalışmalarını tamamladın, harika iş! 🎉");
    } else if (completedSlots.length > 0) {
      const subjects = [...new Set(pendingSlots.map(s => s.subject?.name).filter(Boolean))];
      messages.push(`Bugün ${pendingSlots.length} çalışman kaldı${subjects.length > 0 ? ` (${subjects.slice(0, 2).join(', ')})` : ''}.`);
    } else {
      const subjects = [...new Set(todaySlots.map(s => s.subject?.name).filter(Boolean))];
      const totalMinutes = todaySlots.reduce((sum, s) => sum + s.duration, 0);
      messages.push(`Bugün ${todaySlots.length} çalışma, toplam ${Math.round(totalMinutes / 60)} saat planlanmış${subjects.length > 0 ? ` (${subjects.slice(0, 3).join(', ')})` : ''}.`);
    }
  } else {
    messages.push("Bugün için planlanmış çalışma yok. Yeni bir plan oluşturabilirsin.");
  }

  // 2. Dün ve hafta performansı
  if (studiedYesterday) {
    if (yesterdayMinutes >= 120) {
      messages.push(`Dün ${Math.round(yesterdayMinutes / 60)} saat çalıştın, bu tempoda devam! 💪`);
    }
  } else if (daysStudied >= 5) {
    messages.push(`Bu hafta ${daysStudied} gün çalıştın, düzenli gidiyorsun!`);
  } else if (daysStudied < 3 && daysStudied > 0) {
    messages.push("Bu hafta biraz daha düzenli çalışmayı hedefle.");
  }

  // 3. Başarı oranı veya sınav yaklaşımı
  if (examInfo.daysRemaining !== null && examInfo.daysRemaining <= 30) {
    messages.push(`Sınava ${examInfo.daysRemaining} gün kaldı, son sprinte geçme zamanı!`);
  } else if (weeklySuccessRate !== null) {
    if (weeklySuccessRate >= 80) {
      messages.push(`Haftalık başarı oranın %${weeklySuccessRate}, çok iyi gidiyorsun!`);
    } else if (weeklySuccessRate >= 60) {
      messages.push(`Haftalık %${weeklySuccessRate} başarı oranıyla ilerliyorsun.`);
    } else if (weeklySuccessRate > 0) {
      messages.push("Zayıf konulara biraz daha odaklanmayı dene.");
    }
  }

  // Maksimum 3 mesaj, birleştir
  return messages.slice(0, 3).join(' ');
}

module.exports = {
  getDailyGuidance
};
