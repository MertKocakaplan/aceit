const pomodoroService = require('../services/pomodoro.service');
const logger = require('../utils/logger');

/**
 * Pomodoro kaydet
 * POST /api/pomodoro
 */
exports.saveSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { duration, mode, subjectId } = req.body;

    if (!duration || !mode) {
      return res.status(400).json({
        success: false,
        message: 'duration ve mode gerekli',
      });
    }

    const session = await pomodoroService.savePomodoroSession(userId, {
      duration,
      mode,
      subjectId,
    });

    res.status(201).json({
      success: true,
      message: 'Pomodoro kaydedildi',
      data: session,
    });
  } catch (error) {
    logger.error(`saveSession controller error: ${error.message}`);
    next(error);
  }
};

/**
 * İstatistikleri getir
 * GET /api/pomodoro/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Eğer tarih filtreleri varsa basit stats dön
    if (req.query.startDate || req.query.endDate) {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const stats = await pomodoroService.getUserPomodoroStats(userId, filters);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    }

    // Tarih filtresi yoksa detaylı stats dön (Stats sayfası için)
    const stats = await pomodoroService.getPomodoroStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getStats controller error: ${error.message}`);
    next(error);
  }
};