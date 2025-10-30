const studyPlanAnalysisService = require('../services/studyPlanAnalysis.service');
const logger = require('../utils/logger');

/**
 * Kullanıcı performans analizi
 * GET /api/study-plan/analysis
 */
exports.getUserAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const analysis = await studyPlanAnalysisService.analyzeUserPerformance(
      userId
    );

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error(`getUserAnalysis controller error: ${error.message}`);
    next(error);
  }
};