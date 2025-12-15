const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlan.controller');
const {
  validateCreatePlan,
  validateUpdatePlan,
  validateGenerateAI,
  validateCreateDay,
  validateCreateSlot,
  validateUpdateSlot,
  validateMarkSlotComplete
} = require('../validators/studyPlan.validator');
const { authenticate } = require('../middleware/auth');

/**
 * Tüm study plan route'ları protected
 */
router.use(authenticate);

/**
 * GET /api/study-plans/active
 * Aktif planı getir (bu route /api/study-plans/:id'den önce olmalı)
 */
router.get('/active', studyPlanController.getActivePlan);

/**
 * GET /api/study-plans/active/daily
 * Bugünkü aktif plan günlük hedefini ve ilerlemesini getir
 */
router.get('/active/daily', studyPlanController.getActiveDaily);

/**
 * GET /api/study-plans
 * Kullanıcının tüm planlarını getir
 */
router.get('/', studyPlanController.getAllPlans);

/**
 * GET /api/study-plans/:id
 * Tek bir planı getir
 */
router.get('/:id', studyPlanController.getPlanById);

/**
 * POST /api/study-plans
 * Yeni plan oluştur
 */
router.post('/', validateCreatePlan, studyPlanController.createPlan);

/**
 * PUT /api/study-plans/:id
 * Planı güncelle
 */
router.put('/:id', validateUpdatePlan, studyPlanController.updatePlan);

/**
 * DELETE /api/study-plans/:id
 * Planı sil
 */
router.delete('/:id', studyPlanController.deletePlan);

/**
 * PUT /api/study-plans/:id/activate
 * Planı aktif yap
 */
router.put('/:id/activate', studyPlanController.activatePlan);

/**
 * POST /api/study-plans/generate-ai
 * AI ile plan oluştur
 */
router.post('/generate-ai', validateGenerateAI, studyPlanController.generateAIPlan);

/**
 * GET /api/study-plans/:id/progress
 * Plan ilerleme istatistikleri
 */
router.get('/:id/progress', studyPlanController.getPlanProgress);

/**
 * POST /api/study-plans/:planId/days
 * Day oluştur (manuel plan için)
 */
router.post('/:planId/days', validateCreateDay, studyPlanController.createDay);

/**
 * POST /api/study-plans/days/:dayId/slots
 * Slot oluştur
 */
router.post('/days/:dayId/slots', validateCreateSlot, studyPlanController.createSlot);

/**
 * PUT /api/study-plans/slots/:slotId
 * Slot güncelle
 */
router.put('/slots/:slotId', validateUpdateSlot, studyPlanController.updateSlot);

/**
 * PUT /api/study-plans/slots/:slotId/complete
 * Slot'u tamamlandı olarak işaretle
 */
router.put('/slots/:slotId/complete', validateMarkSlotComplete, studyPlanController.markSlotComplete);

/**
 * DELETE /api/study-plans/slots/:slotId
 * Slot sil
 */
router.delete('/slots/:slotId', studyPlanController.deleteSlot);

module.exports = router;
