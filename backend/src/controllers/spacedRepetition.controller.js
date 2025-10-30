const spacedRepetitionService = require('../services/spacedRepetition.service');
const logger = require('../utils/logger');

/**
 * Konu çalışma sonrası tekrar kaydını güncelle
 */
const updateTopicProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { topicId, performanceScore } = req.body;

    if (!topicId || performanceScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'topicId ve performanceScore gerekli',
      });
    }

    if (performanceScore < 0 || performanceScore > 1) {
      return res.status(400).json({
        success: false,
        message: 'performanceScore 0-1 arasında olmalı',
      });
    }

    const result = await spacedRepetitionService.updateTopicProgress(
      userId,
      topicId,
      performanceScore
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`updateTopicProgress controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Tekrarı gereken konuları getir
 */
const getDueTopics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const topics = await spacedRepetitionService.getTopicsDueForReview(userId, limit);

    res.json({
      success: true,
      data: topics,
    });
  } catch (error) {
    logger.error(`getDueTopics controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Spaced repetition özet istatistikleri
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await spacedRepetitionService.getUserSpacedRepetitionStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getStats controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Belirli bir konu için tekrar bilgisi
 */
const getTopicInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { topicId } = req.params;

    const info = await spacedRepetitionService.getTopicReviewInfo(userId, topicId);

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    logger.error(`getTopicInfo controller error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  updateTopicProgress,
  getDueTopics,
  getStats,
  getTopicInfo,
};
