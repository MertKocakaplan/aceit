const statsService = require('../services/stats.service');
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