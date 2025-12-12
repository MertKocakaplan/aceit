const statsService = require('../services/stats.service');
const examDateService = require('../services/examDate.service');
const dailyGuidanceService = require('../services/dailyGuidance.service');
const performanceAnalysisService = require('../services/ai/performanceAnalysis.service');
const logger = require('../utils/logger');

/**
 * Genel özet istatistikler
 * GET /api/stats/summary
 */
exports.getSummaryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await statsService.getSummaryStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getSummaryStats controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Günlük istatistikler (son N gün)
 * GET /api/stats/daily?days=7
 */
exports.getDailyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 7;
    const stats = await statsService.getDailyStats(userId, days);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getDailyStats controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Haftalık karşılaştırma
 * GET /api/stats/weekly
 */
exports.getWeeklyComparison = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await statsService.getWeeklyComparison(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getWeeklyComparison controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Aylık karşılaştırma
 * GET /api/stats/monthly
 */
exports.getMonthlyComparison = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await statsService.getMonthlyComparison(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getMonthlyComparison controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Ders bazlı dağılım
 * GET /api/stats/subject-breakdown
 */
exports.getSubjectBreakdown = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await statsService.getSubjectBreakdown(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getSubjectBreakdown controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Streak verileri
 * GET /api/stats/streak
 */
exports.getStreak = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const streak = await statsService.getStreakData(userId);

    res.status(200).json({
      success: true,
      data: streak,
    });
  } catch (error) {
    logger.error(`getStreak controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Rekorlar
 * GET /api/stats/records
 */
exports.getRecords = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const records = await statsService.getRecords(userId);

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    logger.error(`getRecords controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Başarı oranı trendi
 * GET /api/stats/success-trend
 */
exports.getSuccessTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trend = await statsService.getSuccessRateTrend(userId);

    res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    logger.error(`getSuccessTrend controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Hazırlık durumu
 * GET /api/stats/preparation
 */
exports.getPreparation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preparation = await statsService.getPreparationProgress(userId);

    res.status(200).json({
      success: true,
      data: preparation,
    });
  } catch (error) {
    logger.error(`getPreparation controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Gelişim hızı
 * GET /api/stats/velocity
 */
exports.getVelocity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const velocity = await statsService.getLearningVelocityAnalysis(userId);

    res.status(200).json({
      success: true,
      data: velocity,
    });
  } catch (error) {
    logger.error(`getVelocity controller error: ${error.message}`);
    next(error);
  }
};

/**
 * 
 * GET /api/stats/overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      summary,
      streak,
      records,
      successTrend,
      preparation,
      velocity,
      weekly,
      daily,
    ] = await Promise.all([
      statsService.getSummaryStats(userId),
      statsService.getStreakData(userId),
      statsService.getRecords(userId),
      statsService.getSuccessRateTrend(userId),
      statsService.getPreparationProgress(userId),
      statsService.getLearningVelocityAnalysis(userId),
      statsService.getWeeklyComparison(userId),
      statsService.getDailyStats(userId, 7),
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary,
        streak,
        records,
        successTrend,
        preparation,
        velocity,
        weekly,
        daily,
      },
    });
  } catch (error) {
    logger.error(`getOverview controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Yıllık aktivite (heatmap)
 * GET /api/stats/yearly-activity
 */
exports.getYearlyActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activity = await statsService.getYearlyActivity(userId);

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error(`getYearlyActivity controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Son 6 ay trend
 * GET /api/stats/six-month-trend
 */
exports.getSixMonthTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trend = await statsService.getSixMonthTrend(userId);

    res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    logger.error(`getSixMonthTrend controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Ders detaylı analiz
 * GET /api/stats/subjects-detailed
 */
exports.getSubjectDetailedAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const analysis = await statsService.getSubjectDetailedAnalysis(userId);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error(`getSubjectDetailedAnalysis controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Konu detaylı analiz
 * GET /api/stats/topics-detailed
 */
exports.getTopicDetailedAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const analysis = await statsService.getTopicDetailedAnalysis(userId);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error(`getTopicDetailedAnalysis controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Sınava kalan süre bilgisi
 * GET /api/stats/exam-countdown
 */
exports.getExamCountdown = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const examInfo = await examDateService.getEffectiveExamDate(userId);

    res.status(200).json({
      success: true,
      data: {
        examDate: examInfo.examDate,
        daysRemaining: examInfo.daysRemaining,
        formattedRemaining: examDateService.formatRemainingTime(examInfo.daysRemaining),
        urgencyLevel: examDateService.getUrgencyLevel(examInfo.daysRemaining),
        source: examInfo.source, // 'user' | 'examYear' | 'none'
        examType: examInfo.examType,
        examYear: examInfo.examYear
      },
    });
  } catch (error) {
    logger.error(`getExamCountdown controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Günlük rehberlik
 * GET /api/stats/daily-guidance
 */
exports.getDailyGuidance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const guidance = await dailyGuidanceService.getDailyGuidance(userId);

    res.status(200).json({
      success: true,
      data: guidance,
    });
  } catch (error) {
    logger.error(`getDailyGuidance controller error: ${error.message}`);
    next(error);
  }
};

/**
 * AI performans analizi ve koçluk önerileri
 * GET /api/stats/ai-analysis
 */
exports.getAIAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const analysis = await performanceAnalysisService.analyzePerformanceWithAI(userId);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error(`getAIAnalysis controller error: ${error.message}`);
    next(error);
  }
};