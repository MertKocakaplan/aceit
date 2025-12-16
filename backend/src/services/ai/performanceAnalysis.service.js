const prisma = require('../../config/database');
const logger = require('../../utils/logger');
const openaiService = require('./openai.service');
const { getLocalDateString } = require('../../utils/dateUtils');
const examDateService = require('../examDate.service');

/**
 * AI Performance Analysis Service
 * Analyzes user's study performance and provides personalized recommendations
 */

/**
 * Kullanıcının tüm çalışma verilerini topla
 */
async function gatherUserData(userId) {
  try {
    // Kullanıcı temel bilgileri
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        examType: true,
        targetScore: true,
        targetDate: true,
        createdAt: true,
      },
    });

    // Resmi sınav tarihi bilgisi
    const examDateInfo = await examDateService.getEffectiveExamDate(userId);
    user.effectiveExamDate = examDateInfo.examDate;
    user.daysRemaining = examDateInfo.daysRemaining;
    user.examDateSource = examDateInfo.source;

    // Toplam çalışma süresi ve session sayısı
    const studySessions = await prisma.studySession.findMany({
      where: { userId },
      include: {
        subject: {
          select: {
            name: true,
            examType: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Ders bazında analiz
    const subjectStats = await prisma.studySession.groupBy({
      by: ['subjectId'],
      where: { userId },
      _sum: {
        duration: true,
        questionsCorrect: true,
        questionsWrong: true,
      },
      _count: {
        id: true,
      },
    });

    // Subject isimleri ile eşleştir
    const subjectIds = subjectStats.map((s) => s.subjectId);
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true },
    });

    const subjectMap = subjects.reduce((acc, subj) => {
      acc[subj.id] = subj.name;
      return acc;
    }, {});

    const enrichedSubjectStats = subjectStats.map((stat) => ({
      subject: subjectMap[stat.subjectId] || 'Bilinmeyen',
      totalDuration: stat._sum.duration || 0,
      sessionCount: stat._count.id,
      correctAnswers: stat._sum.questionsCorrect || 0,
      wrongAnswers: stat._sum.questionsWrong || 0,
      accuracy:
        stat._sum.questionsCorrect || stat._sum.questionsWrong
          ? (
              (stat._sum.questionsCorrect /
                (stat._sum.questionsCorrect + stat._sum.questionsWrong)) *
              100
            ).toFixed(1)
          : 0,
    }));

    // Topic bazında çalışma (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTopics = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
        topicId: { not: null },
      },
      select: {
        topic: true,
        duration: true,
      },
    });

    // Spaced Repetition performansı
    const spacedRepetition = await prisma.userTopicSpacedRepetition.findMany({
      where: { userId },
      select: {
        topic: {
          select: {
            name: true,
          },
        },
        repetitionLevel: true,
        nextReviewAt: true,
        easinessFactor: true,
      },
    });

    // Son 7 gün aktivite
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.studySession.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo },
      },
      select: {
        date: true,
        duration: true,
      },
      orderBy: { date: 'asc' },
    });

    // AI soru çözme istatistikleri
    const aiUsage = await prisma.aIQuestionLog.aggregate({
      where: { userId },
      _count: true,
      _avg: { rating: true },
    });

    return {
      user,
      studySessions,
      subjectStats: enrichedSubjectStats,
      recentTopics,
      spacedRepetition,
      recentActivity,
      aiUsage: {
        totalQuestions: aiUsage._count,
        averageRating: aiUsage._avg.rating
          ? parseFloat(aiUsage._avg.rating.toFixed(2))
          : null,
      },
    };
  } catch (error) {
    logger.error(`Gather user data error: ${error.message}`);
    throw error;
  }
}

/**
 * Verileri analiz et ve temel metrikleri hesapla
 */
function calculateMetrics(userData) {
  const {
    user,
    studySessions,
    subjectStats,
    recentTopics,
    spacedRepetition,
    recentActivity,
  } = userData;

  // Toplam çalışma süresi (dakika)
  const totalStudyTime = studySessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0
  );

  // Toplam doğru/yanlış
  const totalCorrect = studySessions.reduce(
    (sum, session) => sum + (session.questionsCorrect || 0),
    0
  );
  const totalWrong = studySessions.reduce(
    (sum, session) => sum + (session.questionsWrong || 0),
    0
  );
  const overallAccuracy =
    totalCorrect + totalWrong > 0
      ? ((totalCorrect / (totalCorrect + totalWrong)) * 100).toFixed(1)
      : 0;

  // Hedef tarihe kalan gün (resmi veya kullanıcı hedefi)
  const daysUntilExam = user.daysRemaining !== undefined
    ? user.daysRemaining
    : (user.targetDate
        ? Math.ceil((new Date(user.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null);

  // Günlük ortalama çalışma süresi (son 30 gün)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysSessions = studySessions.filter(
    (s) => new Date(s.date) >= thirtyDaysAgo
  );
  const dailyAverage = last30DaysSessions.length > 0
    ? (
        last30DaysSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 30
      ).toFixed(0)
    : 0;

  // Consistency (son 7 gün kaç gün çalışmış, local timezone)
  const last7DaysUnique = new Set(
    recentActivity.map((a) => getLocalDateString(a.date))
  ).size;
  const consistencyScore = ((last7DaysUnique / 7) * 100).toFixed(0);

  // En çok çalışılan ders
  const topSubject = subjectStats.length > 0
    ? subjectStats.reduce((max, stat) =>
        stat.totalDuration > max.totalDuration ? stat : max
      )
    : null;

  // En az çalışılan ders
  const leastSubject = subjectStats.length > 0
    ? subjectStats.reduce((min, stat) =>
        stat.totalDuration < min.totalDuration ? stat : min
      )
    : null;

  // En yüksek başarı oranı
  const bestAccuracySubject = subjectStats.length > 0
    ? subjectStats.reduce((max, stat) =>
        parseFloat(stat.accuracy) > parseFloat(max.accuracy) ? stat : max
      )
    : null;

  // En düşük başarı oranı
  const worstAccuracySubject = subjectStats.length > 0
    ? subjectStats.reduce((min, stat) =>
        parseFloat(stat.accuracy) < parseFloat(min.accuracy) ? stat : min
      )
    : null;

  // Spaced Repetition başarısı
  const avgEasiness = spacedRepetition.length > 0
    ? (
        spacedRepetition.reduce((sum, sr) => sum + sr.easinessFactor, 0) /
        spacedRepetition.length
      ).toFixed(2)
    : null;

  // Topic çeşitliliği
  const uniqueTopics = new Set();
  recentTopics.forEach((rt) => {
    if (rt.topic) {
      uniqueTopics.add(rt.topic.name);
    }
  });

  // ====== YENİ: Zamansal Karşılaştırma ======
  // Son 7 gün vs önceki 7 gün
  const last7Days = getLast7DaysStats(studySessions);
  const previous7Days = getPrevious7DaysStats(studySessions);

  const weeklyComparison = {
    current: {
      totalMinutes: last7Days.totalMinutes,
      avgDaily: parseFloat((last7Days.totalMinutes / 7).toFixed(1)),
      studyDays: last7Days.uniqueDays,
    },
    previous: {
      totalMinutes: previous7Days.totalMinutes,
      avgDaily: parseFloat((previous7Days.totalMinutes / 7).toFixed(1)),
      studyDays: previous7Days.uniqueDays,
    },
    change: {
      minutes: last7Days.totalMinutes - previous7Days.totalMinutes,
      percentage: calculatePercentageChange(
        previous7Days.totalMinutes,
        last7Days.totalMinutes
      ),
      trend: getTrend(previous7Days.totalMinutes, last7Days.totalMinutes),
    },
  };

  // Başarı oranı trendi
  const successRateTrend = {
    current: parseFloat(last7Days.successRate),
    previous: parseFloat(previous7Days.successRate),
    change: parseFloat(
      (parseFloat(last7Days.successRate) - parseFloat(previous7Days.successRate)).toFixed(1)
    ),
    trend: getTrend(
      parseFloat(previous7Days.successRate),
      parseFloat(last7Days.successRate)
    ),
  };

  // Günlük önerilen tempo hesabı
  const recommendedDailyHours = calculateRecommendedPace({
    daysUntilExam,
    currentPace: parseFloat(dailyAverage) / 60,
    totalTopics: uniqueTopics.size,
    studiedTopics: spacedRepetition.length,
    currentSuccessRate: parseFloat(overallAccuracy),
  });

  // Gelişim durumu
  const developmentStatus = calculateDevelopmentStatus({
    weeklyComparison,
    successRateTrend,
  });

  return {
    totalStudyTime,
    totalSessions: studySessions.length,
    totalCorrect,
    totalWrong,
    overallAccuracy,
    daysUntilExam,
    dailyAverage,
    consistencyScore,
    last7DaysActive: last7DaysUnique,
    topSubject,
    leastSubject,
    bestAccuracySubject,
    worstAccuracySubject,
    avgEasiness,
    uniqueTopicsCount: uniqueTopics.size,
    spacedRepetitionCount: spacedRepetition.length,
    // YENİ METRIKLER
    weeklyComparison,
    successRateTrend,
    recommendedDailyHours,
    developmentStatus,
  };
}

/**
 * GPT-5.1 ile kısa ve modüler performans analizi yap
 */
async function analyzePerformanceWithAI(userId) {
  try {
    // Kullanıcı verilerini topla
    const userData = await gatherUserData(userId);
    const metrics = calculateMetrics(userData);

    // AI için koçluk odaklı prompt hazırla
    const systemPrompt = `Sen Türkiye'deki LGS, TYT ve AYT sınavlarına hazırlanan öğrenciler için UZMAN KOÇLUK YAPAN, GELİŞİMİ TAKİP EDEN ve MOTİVE EDEN bir eğitim danışmanısın.

KOÇLUK YAKLAŞIMIN:
1. **Gelişimi Takip Et**: Öğrencinin GEÇMİŞTEKİ performansıyla BUGÜNKÜNÜ karşılaştır
2. **Trend Analizi Yap**: İyiye mi kötüye mi gidiyor, NET söyle
3. **Somut Geri Bildirim**: "Geçen haftaya göre %X daha fazla çalıştın"
4. **Tempo Tavsiyesi**: Günde kaç saat çalışması gerektiğini HESAPLA ve öner
5. **Motive Et ama Gerçekçi Ol**: Gelişiyorsa ÖVGÜ, azalıyorsa UYARI

KURALLAR:
1. Her yorum MAKSIMUM 2-3 cümle
2. "Sen" diye hitap et
3. **MUTLaka zamansal karşılaştırma yap**:
   - ❌ "Toplam 50 saat çalıştın" (sadece rakam)
   - ✅ "Geçen haftaya göre %20 daha az çalıştın, dikkat!" (karşılaştırma)

4. **Trend belirt**:
   - ✅ "Son günlerde temponu artırdın, harika!"
   - ✅ "Bu hafta geçen haftadan daha az çalıştın, toparlanman lazım"
   - ✅ "Başarı oranın yükselişte, böyle devam"

5. **Günlük tempo tavsiyesi ver**:
   - "Sınava yetişmek için günde [X] saat çalışmalısın"
   - Mevcut tempo vs önerilen tempo karşılaştır

6. **Gelişim durumu NET**:
   - 🟢 Mükemmel: "Harika gidiyorsun, bu performansı sürdür!"
   - 🟡 İyi: "İyi gidiyorsun ama biraz daha tempo artırabilirsin"
   - 🟠 Gelişmeli: "Tempo düştü, son günlerde daha az çalışıyorsun!"
   - 🔴 Kritik: "DİKKAT! Bu tempoyla hedefine ulaşamazsın!"

RESPONSE FORMATI (JSON):
{
  "overview": {
    "summary": "GELİŞİM ve TREND odaklı 2-3 cümle. Geçen hafta/ay ile karşılaştırma YAP.",
    "weeklyGoal": "Bu hafta için SOMUT hedef",
    "developmentStatus": "excellent | good | needs_improvement | critical"
  },
  "subjects": [
    {
      "subjectName": "Ders adı",
      "comment": "Bu dersteki GELİŞİM ve TREND (2-3 cümle)"
    }
  ],
  "topics": {
    "weakComment": "Zayıf konular için öneri (gelişim odaklı)",
    "strongComment": "Güçlü konular için motivasyon"
  },
  "coaching": {
    "recommendedDailyHours": 5.5,
    "currentPace": 3.2,
    "urgentActions": [
      "En acil yapılması gereken 1-2 somut aksiyon"
    ],
    "weeklyTrend": "improving | declining | stable",
    "motivationalMessage": "Kısa motivasyon mesajı"
  }
}

ÖNEMLİ: Sadece JSON formatında yanıt ver!`;

    const userPrompt = `Öğrenci Profili:
- Sınav: ${userData.user.examType}
- Sınava Kalan: ${metrics.daysUntilExam ? `${metrics.daysUntilExam} gün` : 'Belirtilmemiş'}

GELİŞİM ANALİZİ (ZAMANSAL KARŞILAŞTIRMA):

Son 7 Gün vs Önceki 7 Gün:
- Şu anki hafta: ${metrics.weeklyComparison.current.totalMinutes} dk (günde ${metrics.weeklyComparison.current.avgDaily.toFixed(0)} dk)
- Önceki hafta: ${metrics.weeklyComparison.previous.totalMinutes} dk (günde ${metrics.weeklyComparison.previous.avgDaily.toFixed(0)} dk)
- FARK: ${metrics.weeklyComparison.change.minutes > 0 ? '+' : ''}${metrics.weeklyComparison.change.minutes} dk (${metrics.weeklyComparison.change.percentage}%)
- TREND: ${metrics.weeklyComparison.change.trend === 'improving' ? '📈 YÜKSELIŞ' : metrics.weeklyComparison.change.trend === 'declining' ? '📉 DÜŞÜŞ' : '➡️ SABIT'}

Başarı Oranı Gelişimi:
- Bu hafta: %${metrics.successRateTrend.current}
- Geçen hafta: %${metrics.successRateTrend.previous}
- FARK: ${metrics.successRateTrend.change > 0 ? '+' : ''}${metrics.successRateTrend.change}%
- TREND: ${metrics.successRateTrend.trend === 'improving' ? '📈 YÜKSELIŞ' : metrics.successRateTrend.trend === 'declining' ? '📉 DÜŞÜŞ' : '➡️ SABIT'}

Tempo Analizi:
- Önerilen günlük tempo: ${metrics.recommendedDailyHours} saat
- Mevcut günlük ortalama: ${(metrics.dailyAverage / 60).toFixed(1)} saat
- ${(metrics.dailyAverage / 60) >= metrics.recommendedDailyHours ? '✅ YETERLI' : '⚠️ YETERSIZ (günde ' + (metrics.recommendedDailyHours - (metrics.dailyAverage / 60)).toFixed(1) + ' saat DAHA çalışmalısın)'}

Genel Durum:
- Gelişim Durumu: ${metrics.developmentStatus}
  * excellent: Mükemmel gelişim
  * good: İyi gidiyor
  * needs_improvement: Gelişmeli
  * critical: Kritik durum!
- Düzenlilik: Son 7 gün ${metrics.last7DaysActive}/7 gün çalıştı
- Toplam: ${(metrics.totalStudyTime / 60).toFixed(1)} saat

Dersler:
${userData.subjectStats.map((s) => `- ${s.subject}: ${Math.floor(s.totalDuration / 60)}s, %${s.accuracy}`).join('\n')}

KOÇLUK YAP!
- Gelişimi VURGULA (geçen haftaya göre nasıl)
- Trend belirt (yükseliyor mu, düşüyor mu)
- Günlük tempo tavsiyesi ver
- Motive et veya uyar (duruma göre)

KISA VE ÖZ JSON yanıt ver!`;

    const input = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: userPrompt,
          },
        ],
      },
    ];

    logger.info('Generating modular performance analysis with AI', { userId });

    const startTime = Date.now();
    const response = await openaiService.createResponse({
      model: 'gpt-5.1',
      input,
      reasoning_effort: 'medium', // Orta seviye düşünme yeterli
      verbosity: 'low', // Kısa yanıt
      max_output_tokens: 5000, // JSON response için yeterli (7+ ders analizi)
    });

    const duration = Date.now() - startTime;

    let aiAnalysis = response.output_text;
    const tokensUsed = response.usage?.total_tokens || 0;

    // JSON parse et
    try {
      // JSON bloğunu temizle (```json ... ``` veya ``` ... ``` formatında olabilir)
      aiAnalysis = aiAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const parsedAnalysis = JSON.parse(aiAnalysis);

      logger.info('Performance analysis generated', {
        userId,
        tokensUsed,
        duration: `${duration}ms`,
      });

      // Token kullanımını veritabanına kaydet
      await prisma.aIQuestionLog.create({
        data: {
          userId,
          questionText: 'Performans Analizi',
          questionImage: null,
          aiResponse: JSON.stringify(parsedAnalysis),
          aiModel: response.model,
          tokensUsed,
          responseTime: duration,
          rating: null,
        },
      });

      return {
        generatedAt: new Date(),
        overview: parsedAnalysis.overview || {
          summary: '',
          weeklyGoal: '',
          developmentStatus: 'good',
        },
        subjects: parsedAnalysis.subjects || [],
        topics: parsedAnalysis.topics || { weakComment: '', strongComment: '' },
        coaching: parsedAnalysis.coaching || {
          recommendedDailyHours: metrics.recommendedDailyHours,
          currentPace: parseFloat((metrics.dailyAverage / 60).toFixed(1)),
          urgentActions: [],
          weeklyTrend: metrics.weeklyComparison.change.trend,
          motivationalMessage: '',
        },
        // Metrikleri de döndür (frontend kullanabilsin)
        metrics: {
          weeklyComparison: metrics.weeklyComparison,
          successRateTrend: metrics.successRateTrend,
          recommendedDailyHours: metrics.recommendedDailyHours,
          developmentStatus: metrics.developmentStatus,
        },
        meta: {
          tokensUsed,
          duration,
          model: response.model,
        },
      };
    } catch (parseError) {
      logger.error(`JSON parse error: ${parseError.message}`, { aiAnalysis });

      // Fallback: JSON parse edilemezse boş yanıt dön
      return {
        generatedAt: new Date(),
        overview: {
          summary: 'Analiz oluşturulurken bir hata oluştu.',
          weeklyGoal: 'Lütfen daha sonra tekrar deneyin.',
          developmentStatus: 'good',
        },
        subjects: [],
        topics: {
          weakComment: '',
          strongComment: '',
        },
        coaching: {
          recommendedDailyHours: metrics.recommendedDailyHours,
          currentPace: parseFloat((metrics.dailyAverage / 60).toFixed(1)),
          urgentActions: [],
          weeklyTrend: metrics.weeklyComparison.change.trend,
          motivationalMessage: '',
        },
        metrics: {
          weeklyComparison: metrics.weeklyComparison,
          successRateTrend: metrics.successRateTrend,
          recommendedDailyHours: metrics.recommendedDailyHours,
          developmentStatus: metrics.developmentStatus,
        },
        meta: {
          tokensUsed,
          duration,
          model: response.model,
        },
      };
    }
  } catch (error) {
    logger.error(`Performance analysis error: ${error.message}`);
    throw error;
  }
}

/**
 * Son 7 günün çalışma istatistiklerini hesapla
 */
function getLast7DaysStats(sessions) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSessions = sessions.filter(
    (s) => new Date(s.date) >= sevenDaysAgo
  );

  const uniqueDays = new Set(
    recentSessions.map((s) =>
      getLocalDateString(new Date(s.date))
    )
  ).size;

  // Doğru/yanlış sayısı
  const correctAnswers = recentSessions.reduce(
    (sum, s) => sum + (s.questionsCorrect || 0),
    0
  );
  const wrongAnswers = recentSessions.reduce(
    (sum, s) => sum + (s.questionsWrong || 0),
    0
  );

  return {
    totalMinutes: recentSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    ),
    uniqueDays,
    sessions: recentSessions,
    correctAnswers,
    wrongAnswers,
    successRate:
      correctAnswers + wrongAnswers > 0
        ? ((correctAnswers / (correctAnswers + wrongAnswers)) * 100).toFixed(1)
        : 0,
  };
}

/**
 * Önceki 7 günün çalışma istatistiklerini hesapla (8-14 gün önce)
 */
function getPrevious7DaysStats(sessions) {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const previousSessions = sessions.filter((s) => {
    const date = new Date(s.date);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });

  const uniqueDays = new Set(
    previousSessions.map((s) =>
      getLocalDateString(new Date(s.date))
    )
  ).size;

  // Doğru/yanlış sayısı
  const correctAnswers = previousSessions.reduce(
    (sum, s) => sum + (s.questionsCorrect || 0),
    0
  );
  const wrongAnswers = previousSessions.reduce(
    (sum, s) => sum + (s.questionsWrong || 0),
    0
  );

  return {
    totalMinutes: previousSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    ),
    uniqueDays,
    sessions: previousSessions,
    correctAnswers,
    wrongAnswers,
    successRate:
      correctAnswers + wrongAnswers > 0
        ? ((correctAnswers / (correctAnswers + wrongAnswers)) * 100).toFixed(1)
        : 0,
  };
}

/**
 * Yüzde değişim hesapla
 */
function calculatePercentageChange(oldValue, currentValue) {
  if (oldValue === 0) return currentValue > 0 ? 100 : 0;
  return parseFloat((((currentValue - oldValue) / oldValue) * 100).toFixed(1));
}

/**
 * Trend belirle (improving, declining, stable)
 */
function getTrend(oldValue, currentValue) {
  const diff = currentValue - oldValue;
  const threshold = oldValue * 0.1; // %10 değişim eşiği

  if (diff > threshold) return 'improving';
  if (diff < -threshold) return 'declining';
  return 'stable';
}

/**
 * Günlük önerilen çalışma temposunu hesapla
 */
function calculateRecommendedPace({
  daysUntilExam,
  currentPace,
  totalTopics,
  studiedTopics,
  currentSuccessRate,
}) {
  // Sınav tarihi yoksa varsayılan 4 saat
  if (!daysUntilExam || daysUntilExam <= 0) {
    return 4;
  }

  // Kalan konular
  const remainingTopics = Math.max(0, totalTopics - studiedTopics);

  // Başarı oranı düşükse daha fazla çalışma gerekli
  const successMultiplier =
    currentSuccessRate < 70 ? 1.3 : currentSuccessRate < 80 ? 1.1 : 1.0;

  // Sınav yaklaştıkça tempo artmalı
  const urgencyMultiplier =
    daysUntilExam < 30 ? 1.4 : daysUntilExam < 60 ? 1.2 : 1.0;

  // Temel tempo: kalan konular / kalan günler
  const basePace =
    remainingTopics > 0
      ? Math.max(3, Math.min(8, (remainingTopics / daysUntilExam) * 0.5))
      : 4;

  const recommendedPace = basePace * successMultiplier * urgencyMultiplier;

  // 0.5 saate yuvarla (örn: 4.5, 5.0, 5.5)
  return Math.round(recommendedPace * 2) / 2;
}

/**
 * Gelişim durumunu değerlendir
 */
function calculateDevelopmentStatus({ weeklyComparison, successRateTrend }) {
  const paceChange = weeklyComparison.change.percentage;
  const successChange = successRateTrend.change;

  // İki metriği de dikkate al
  if (paceChange > 20 && successChange > 5) return 'excellent';
  if (paceChange > 0 && successChange >= 0) return 'good';
  if (paceChange < -20 || successChange < -10) return 'critical';
  return 'needs_improvement';
}

module.exports = {
  analyzePerformanceWithAI,
  gatherUserData,
  calculateMetrics,
};
