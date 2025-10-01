const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject.controller');
const { authenticate } = require('../middleware/auth');

/**
 * Tüm subject route'ları protected (giriş gerektirir)
 */
router.use(authenticate);

/**
 * GET /api/subjects
 * Kullanıcının derslerini getir (sınav türüne göre + istatistikler)
 */
router.get('/', subjectController.getUserSubjects);

/**
 * GET /api/subjects/:id
 * Ders detayını getir
 */
router.get('/:id', subjectController.getSubjectById);

/**
 * GET /api/subjects/:id/topics
 * Dersin konularını getir
 */
router.get('/:id/topics', subjectController.getSubjectTopics);

module.exports = router;