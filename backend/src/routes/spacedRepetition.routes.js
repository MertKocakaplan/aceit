const express = require('express');
const router = express.Router();
const spacedRepetitionController = require('../controllers/spacedRepetition.controller');
const { authenticate } = require('../middleware/auth');

// Tüm route'lar authentication gerektirir
router.use(authenticate);

/**
 * @route   POST /api/spaced-repetition/update
 * @desc    Konu çalışma sonrası tekrar kaydını güncelle
 * @access  Private
 */
router.post('/update', spacedRepetitionController.updateTopicProgress);

/**
 * @route   GET /api/spaced-repetition/due
 * @desc    Tekrarı gereken konuları getir
 * @access  Private
 */
router.get('/due', spacedRepetitionController.getDueTopics);

/**
 * @route   GET /api/spaced-repetition/stats
 * @desc    Spaced repetition istatistikleri
 * @access  Private
 */
router.get('/stats', spacedRepetitionController.getStats);

/**
 * @route   GET /api/spaced-repetition/topic/:topicId
 * @desc    Belirli bir konu için tekrar bilgisi
 * @access  Private
 */
router.get('/topic/:topicId', spacedRepetitionController.getTopicInfo);

module.exports = router;
