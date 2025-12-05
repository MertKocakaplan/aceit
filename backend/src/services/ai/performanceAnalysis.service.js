const prisma = require('../../config/database');
const logger = require('../../utils/logger');
const openaiService = require('./openai.service');
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

  // Consistency (son 7 gün kaç gün çalışmış)
  const last7DaysUnique = new Set(
    recentActivity.map((a) => a.date.toISOString().split('T')[0])
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

    // AI için kısa ve öz prompt hazırla
    const systemPrompt = `Sen Türkiye'deki LGS, TYT ve AYT sınavlarına hazırlanan öğrenciler için uzman bir eğitim danışmanısın.

GÖREV: Öğrencinin performansını analiz edip KISA VE ÖZ yorumlar yap.

KURALLAR:
1. Her yorum MAKSIMUM 2-3 cümle olmalı
2. Somut verilere dayanmalı
3. Teşvik edici ve motive edici ol
4. Öğrenciye "sen" diye hitap et
5. Gereksiz açıklamalar yapma

RESPONSE FORMATI (JSON olarak dön):
{
  "overview": {
    "summary": "Genel durum hakkında 2-3 cümle",
    "weeklyGoal": "Bu hafta için 1-2 cümle öneri"
  },
  "subjects": [
    {
      "subjectName": "Ders adı",
      "comment": "Bu ders hakkında 2-3 cümle yorum"
    }
  ],
  "topics": {
    "weakComment": "Zayıf konular için 2-3 cümle öneri",
    "strongComment": "Güçlü konular için 2-3 cümle motivasyon"
  }
}

ÖNEMLİ: Sadece JSON formatında yanıt ver, başka hiçbir şey ekleme!`;

    const userPrompt = `Öğrenci Profili:
- Sınav: ${userData.user.examType}
- Hedef: ${userData.user.targetScore || 'Belirtilmemiş'}
- Kalan Süre: ${metrics.daysUntilExam ? `${metrics.daysUntilExam} gün` : 'Belirtilmemiş'}

İstatistikler:
- Toplam: ${(metrics.totalStudyTime / 60).toFixed(1)} saat, ${metrics.totalSessions} oturum
- Günlük Ort: ${metrics.dailyAverage} dk
- Düzenlilik: %${metrics.consistencyScore} (Son 7 gün: ${metrics.last7DaysActive}/7)
- Başarı: %${metrics.overallAccuracy} (${metrics.totalCorrect} doğru, ${metrics.totalWrong} yanlış)

Dersler:
${userData.subjectStats.map((s) => `- ${s.subject}: ${Math.floor(s.totalDuration / 60)}s, %${s.accuracy}`).join('\n')}

Konular:
- Toplam: ${metrics.uniqueTopicsCount} konu
- Spaced Rep: ${metrics.spacedRepetitionCount}
${metrics.worstAccuracySubject ? `- Zayıf: ${metrics.worstAccuracySubject.subject} (%${metrics.worstAccuracySubject.accuracy})` : ''}
${metrics.bestAccuracySubject ? `- Güçlü: ${metrics.bestAccuracySubject.subject} (%${metrics.bestAccuracySubject.accuracy})` : ''}

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
      max_output_tokens: 2000, // Kısa analiz için yeterli
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

      return {
        generatedAt: new Date(),
        overview: parsedAnalysis.overview || { summary: '', weeklyGoal: '' },
        subjects: parsedAnalysis.subjects || [],
        topics: parsedAnalysis.topics || { weakComment: '', strongComment: '' },
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
        },
        subjects: [],
        topics: {
          weakComment: '',
          strongComment: '',
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

module.exports = {
  analyzePerformanceWithAI,
  gatherUserData,
  calculateMetrics,
};
