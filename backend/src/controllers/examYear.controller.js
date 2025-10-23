const examYearService = require('../services/examYear.service');
const logger = require('../utils/logger');

/**
 * Tüm sınav yıllarını getir
 * GET /api/admin/exam-years
 */
exports.getAllExamYears = async (req, res, next) => {
  try {
    const examYears = await examYearService.getAllExamYears();

    res.status(200).json({
      success: true,
      data: examYears,
    });
  } catch (error) {
    logger.error(`getAllExamYears controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Yıl detayı
 * GET /api/admin/exam-years/:id
 */
exports.getExamYearById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const examYear = await examYearService.getExamYearById(id);

    res.status(200).json({
      success: true,
      data: examYear,
    });
  } catch (error) {
    logger.error(`getExamYearById controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Yeni yıl oluştur
 * POST /api/admin/exam-years
 */
exports.createExamYear = async (req, res, next) => {
  try {
    const examYear = await examYearService.createExamYear(req.body);

    res.status(201).json({
      success: true,
      message: 'Sınav yılı oluşturuldu',
      data: examYear,
    });
  } catch (error) {
    logger.error(`createExamYear controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Yılı güncelle
 * PUT /api/admin/exam-years/:id
 */
exports.updateExamYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    const examYear = await examYearService.updateExamYear(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Sınav yılı güncellendi',
      data: examYear,
    });
  } catch (error) {
    logger.error(`updateExamYear controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Aktif yılı değiştir
 * PATCH /api/admin/exam-years/:id/set-active
 */
exports.setActiveYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    const examYear = await examYearService.setActiveYear(id);

    res.status(200).json({
      success: true,
      message: 'Aktif yıl değiştirildi',
      data: examYear,
    });
  } catch (error) {
    logger.error(`setActiveYear controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Yılı sil
 * DELETE /api/admin/exam-years/:id
 */
exports.deleteExamYear = async (req, res, next) => {
  try {
    const { id } = req.params;
    await examYearService.deleteExamYear(id);

    res.status(200).json({
      success: true,
      message: 'Sınav yılı silindi',
    });
  } catch (error) {
    logger.error(`deleteExamYear controller error: ${error.message}`);
    next(error);
  }
};