const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  optionalUpload,
  validateQuestionInput,
} = require('../middleware/upload');
const aiController = require('../controllers/ai.controller');

/**
 * AI Routes
 * Base path: /api/ai
 */

// Public route - AI servis durumu
router.get('/status', aiController.getAIStatus);

// Protected routes - Authentication required
router.use(authenticate);

/**
 * Question Solver Routes
 */

// POST /api/ai/solve-question - Soru çöz
router.post(
  '/solve-question',
  optionalUpload,
  validateQuestionInput,
  aiController.solveQuestion
);

// GET /api/ai/history - Soru geçmişi
router.get('/history', aiController.getQuestionHistory);

// GET /api/ai/question/:id - Tek soru detayı
router.get('/question/:id', aiController.getQuestionById);

// POST /api/ai/question/:id/rate - Soru değerlendir
router.post('/question/:id/rate', aiController.rateQuestion);

// GET /api/ai/stats - AI kullanım istatistikleri
router.get('/stats', aiController.getAIStats);

/**
 * Performance Analysis Route
 */

// GET /api/ai/performance-analysis - Performans analizi ve koçluk
router.get('/performance-analysis', aiController.getPerformanceAnalysis);

module.exports = router;
