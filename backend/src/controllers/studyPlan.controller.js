const studyPlanService = require('../services/studyPlan.service');
const studyPlanGeneratorService = require('../services/ai/studyPlanGenerator.service');
const openaiClient = require('../config/openai');
const logger = require('../utils/logger');

/**
 * Kullanıcının tüm planlarını getir
 * GET /api/study-plans
 */
exports.getAllPlans = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const plans = await studyPlanService.getUserPlans(userId);

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    logger.error(`getAllPlans controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Aktif planı getir
 * GET /api/study-plans/active
 */
exports.getActivePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const plan = await studyPlanService.getActivePlan(userId);

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    logger.error(`getActivePlan controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Tek bir planı getir
 * GET /api/study-plans/:id
 */
exports.getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await studyPlanService.getPlanById(id, userId);

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    logger.error(`getPlanById controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Yeni plan oluştur
 * POST /api/study-plans
 */
exports.createPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planData = req.validatedData;

    const plan = await studyPlanService.createPlan(userId, planData);

    res.status(201).json({
      success: true,
      message: 'Plan başarıyla oluşturuldu',
      data: plan
    });
  } catch (error) {
    logger.error(`createPlan controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Planı güncelle
 * PUT /api/study-plans/:id
 */
exports.updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.validatedData;

    const plan = await studyPlanService.updatePlan(id, userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Plan başarıyla güncellendi',
      data: plan
    });
  } catch (error) {
    logger.error(`updatePlan controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Planı sil
 * DELETE /api/study-plans/:id
 */
exports.deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await studyPlanService.deletePlan(id, userId);

    res.status(200).json({
      success: true,
      message: 'Plan başarıyla silindi'
    });
  } catch (error) {
    logger.error(`deletePlan controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Planı aktif yap
 * PUT /api/study-plans/:id/activate
 */
exports.activatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await studyPlanService.activatePlan(id, userId);

    res.status(200).json({
      success: true,
      message: 'Plan aktif edildi',
      data: plan
    });
  } catch (error) {
    logger.error(`activatePlan controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Day oluştur (manuel plan için)
 * POST /api/study-plans/:planId/days
 */
exports.createDay = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;
    const dayData = req.validatedData;

    const day = await studyPlanService.createDay(planId, userId, dayData);

    res.status(201).json({
      success: true,
      message: 'Gün başarıyla oluşturuldu',
      data: day
    });
  } catch (error) {
    logger.error(`createDay controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Slot oluştur
 * POST /api/study-plans/days/:dayId/slots
 */
exports.createSlot = async (req, res, next) => {
  try {
    const { dayId } = req.params;
    const userId = req.user.id;
    const slotData = req.validatedData;

    const slot = await studyPlanService.createSlot(dayId, userId, slotData);

    res.status(201).json({
      success: true,
      message: 'Slot başarıyla oluşturuldu',
      data: slot
    });
  } catch (error) {
    logger.error(`createSlot controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Slot güncelle
 * PUT /api/study-plans/slots/:slotId
 */
exports.updateSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const userId = req.user.id;
    const updateData = req.validatedData;

    const slot = await studyPlanService.updateSlot(slotId, userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Slot başarıyla güncellendi',
      data: slot
    });
  } catch (error) {
    logger.error(`updateSlot controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Slot'u tamamlandı olarak işaretle
 * PUT /api/study-plans/slots/:slotId/complete
 */
exports.markSlotComplete = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const userId = req.user.id;
    const { completed } = req.body;

    const slot = await studyPlanService.markSlotComplete(slotId, userId, completed);

    res.status(200).json({
      success: true,
      message: `Slot ${completed ? 'tamamlandı' : 'tamamlanmadı olarak işaretlendi'}`,
      data: slot
    });
  } catch (error) {
    logger.error(`markSlotComplete controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Slot sil
 * DELETE /api/study-plans/slots/:slotId
 */
exports.deleteSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const userId = req.user.id;

    await studyPlanService.deleteSlot(slotId, userId);

    res.status(200).json({
      success: true,
      message: 'Slot başarıyla silindi'
    });
  } catch (error) {
    logger.error(`deleteSlot controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Plan progress hesapla
 * GET /api/study-plans/:id/progress
 */
exports.getPlanProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const progress = await studyPlanService.getPlanProgress(id, userId);

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error(`getPlanProgress controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * AI ile plan oluştur
 * POST /api/study-plans/generate-ai
 */
exports.generateAIPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = req.validatedData;

    // OpenAI hazır mı kontrol et
    if (!openaiClient.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'AI servisi şu anda kullanılamıyor'
      });
    }

    const plan = await studyPlanGeneratorService.generateStudyPlan(userId, preferences);

    res.status(201).json({
      success: true,
      message: 'AI planı başarıyla oluşturuldu',
      data: plan
    });
  } catch (error) {
    logger.error(`generateAIPlan controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};
