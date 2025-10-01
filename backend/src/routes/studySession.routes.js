const express = require('express');
const router = express.Router();
const studySessionController = require('../controllers/studySession.controller');
const {
  validateCreateStudySession,
  validateUpdateStudySession,
} = require('../validators/studySession.validator');
const { authenticate } = require('../middleware/auth');

/**
 * Tüm study session route'ları protected
 */
router.use(authenticate);

/**
 * POST /api/study-sessions
 * Yeni çalışma kaydı oluştur
 */
router.post('/', validateCreateStudySession, studySessionController.createStudySession);

/**
 * GET /api/study-sessions
 * Kullanıcının çalışma kayıtlarını getir
 * Query params: subjectId, startDate, endDate, limit, page
 */
router.get('/', studySessionController.getUserStudySessions);

/**
 * GET /api/study-sessions/:id
 * Tek bir çalışma kaydını getir
 */
router.get('/:id', studySessionController.getStudySessionById);

/**
 * PUT /api/study-sessions/:id
 * Çalışma kaydını güncelle
 */
router.put('/:id', validateUpdateStudySession, studySessionController.updateStudySession);

/**
 * DELETE /api/study-sessions/:id
 * Çalışma kaydını sil
 */
router.delete('/:id', studySessionController.deleteStudySession);

module.exports = router;