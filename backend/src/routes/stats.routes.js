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

/**
 * GET /api/stats/streak
 * Streak verileri (üst üste çalışma)
 */
router.get('/streak', statsController.getStreak);

/**
 * GET /api/stats/records
 * Rekorlar (en çok soru, en çok saat)
 */
router.get('/records', statsController.getRecords);

/**
 * GET /api/stats/success-trend
 * Başarı oranı trendi (son 4 hafta)
 */
router.get('/success-trend', statsController.getSuccessTrend);

/**
 * GET /api/stats/preparation
 * Hazırlık yüzdesi (konu tamamlama oranı)
 */
router.get('/preparation', statsController.getPreparation);

/**
 * GET /api/stats/velocity
 * Gelişim hızı analizi
 */
router.get('/velocity', statsController.getVelocity);

/**
 * GET /api/stats/overview
 * FAZ 1: Genel Özet ve Performans Analizi (Tüm veriler)
 */
router.get('/overview', statsController.getOverview);

/**
 * GET /api/stats/yearly-activity
 * Yıllık aktivite (heatmap için)
 */
router.get('/yearly-activity', statsController.getYearlyActivity);

/**
 * GET /api/stats/six-month-trend
 * Son 6 aylık trend
 */
router.get('/six-month-trend', statsController.getSixMonthTrend);

/**
 * GET /api/stats/subjects-detailed
 * Ders detaylı analiz (Dersler tab'ı için)
 */
router.get('/subjects-detailed', statsController.getSubjectDetailedAnalysis);

/**
 * GET /api/stats/topics-detailed
 * Konu detaylı analiz (Konular tab'ı için)
 */
router.get('/topics-detailed', statsController.getTopicDetailedAnalysis);

/**
 * GET /api/stats/exam-countdown
 * Sınava kalan süre bilgisi
 */
router.get('/exam-countdown', statsController.getExamCountdown);

/**
 * GET /api/stats/daily-guidance
 * Günlük rehberlik
 */
router.get('/daily-guidance', statsController.getDailyGuidance);

module.exports = router;