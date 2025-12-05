const questionSolverService = require('../services/ai/questionSolver.service');
const performanceAnalysisService = require('../services/ai/performanceAnalysis.service');
const openaiClient = require('../config/openai');
const logger = require('../utils/logger');

/**
 * AI Controller
 * Handles AI-powered features: question solving, study plans, coaching
 */

/**
 * POST /api/ai/solve-question
 * Soru çöz (metin ve/veya görüntü)
 */
const solveQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionText } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    // OpenAI client hazır mı kontrol et
    if (!openaiClient.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      });
    }

    logger.info('Question solve request', {
      userId,
      hasText: !!questionText,
      hasImage: !!imageBuffer,
    });

    // Soruyu çöz
    const result = await questionSolverService.solveQuestion(
      userId,
      questionText,
      imageBuffer
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Solve question error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || 'Soru çözülürken hata oluştu',
    });
  }
};

/**
 * GET /api/ai/history
 * Kullanıcının soru geçmişini getir
 */
const getQuestionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const result = await questionSolverService.getUserQuestionHistory(
      userId,
      parseInt(limit),
      parseInt(page)
    );

    res.status(200).json({
      success: true,
      data: result.questions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`Get question history error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Geçmiş sorular getirilirken hata oluştu',
    });
  }
};

/**
 * GET /api/ai/question/:id
 * Tek bir soru çözümünü getir
 */
const getQuestionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const question = await questionSolverService.getQuestionById(id, userId);

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    logger.error(`Get question by ID error: ${error.message}`);
    res.status(404).json({
      success: false,
      message: error.message || 'Soru bulunamadı',
    });
  }
};

/**
 * POST /api/ai/question/:id/rate
 * Soru çözümünü değerlendir
 */
const rateQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Değerlendirme 1-5 arası olmalıdır',
      });
    }

    const updatedQuestion = await questionSolverService.rateQuestion(
      id,
      userId,
      parseInt(rating)
    );

    res.status(200).json({
      success: true,
      data: updatedQuestion,
      message: 'Değerlendirmeniz kaydedildi',
    });
  } catch (error) {
    logger.error(`Rate question error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || 'Değerlendirme kaydedilirken hata oluştu',
    });
  }
};

/**
 * GET /api/ai/stats
 * Kullanıcının AI kullanım istatistiklerini getir
 */
const getAIStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await questionSolverService.getUserAIStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Get AI stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilirken hata oluştu',
    });
  }
};

/**
 * GET /api/ai/status
 * AI servisinin durumunu kontrol et
 */
const getAIStatus = async (req, res) => {
  try {
    const isReady = openaiClient.isReady();

    res.status(200).json({
      success: true,
      data: {
        available: isReady,
        model: process.env.OPENAI_MODEL || 'gpt-5.1',
        features: {
          questionSolver: isReady,
          studyPlanner: isReady, // ✅ Implemente edildi
          performanceAnalysis: isReady, // ✅ Implemente edildi
          coaching: false, // Henüz implemente edilmedi
          dailyGuidance: false, // Henüz implemente edilmedi
        },
      },
    });
  } catch (error) {
    logger.error(`Get AI status error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Durum kontrol edilirken hata oluştu',
    });
  }
};

/**
 * GET /api/ai/performance-analysis
 * Kullanıcının performans analizi ve koçluk
 */
const getPerformanceAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    // OpenAI client hazır mı kontrol et
    if (!openaiClient.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      });
    }

    logger.info('Performance analysis request', { userId });

    // Performans analizi yap
    const result = await performanceAnalysisService.analyzePerformanceWithAI(
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Performance analysis error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || 'Performans analizi yapılırken hata oluştu',
    });
  }
};

module.exports = {
  solveQuestion,
  getQuestionHistory,
  getQuestionById,
  rateQuestion,
  getAIStats,
  getAIStatus,
  getPerformanceAnalysis,
};
