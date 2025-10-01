const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticate } = require('../middleware/auth');

/**
 * Tüm stats route'ları protected
 */
router.use(authenticate);

/**
 * GET /api/stats/summary
 * Genel özet istatistikler
 */
router.get('/summary', statsController.getSummaryStats);

/**
 * GET /api/stats/daily
 * Günlük istatistikler (son N gün)
 * Query: days (default: 7)
 */
router.get('/daily', statsController.getDailyStats);

/**
 * GET /api/stats/weekly
 * Haftalık karşılaştırma (bu hafta vs geçen hafta)
 */
router.get('/weekly', statsController.getWeeklyComparison);

/**
 * GET /api/stats/monthly
 * Aylık karşılaştırma (bu ay vs geçen ay)
 */
router.get('/monthly', statsController.getMonthlyComparison);

/**
 * GET /api/stats/subject-breakdown
 * Ders bazlı dağılım
 */
router.get('/subject-breakdown', statsController.getSubjectBreakdown);

module.exports = router;