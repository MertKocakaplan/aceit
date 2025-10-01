const studySessionService = require('../services/studySession.service');
const logger = require('../utils/logger');

/**
 * Yeni çalışma kaydı oluştur
 * POST /api/study-sessions
 */
exports.createStudySession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionData = req.validatedData;

    const studySession = await studySessionService.createStudySession(userId, sessionData);

    res.status(201).json({
      success: true,
      message: 'Çalışma kaydı başarıyla oluşturuldu',
      data: studySession,
    });
  } catch (error) {
    logger.error(`createStudySession controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Kullanıcının çalışma kayıtlarını getir
 * GET /api/study-sessions
 */
exports.getUserStudySessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      subjectId: req.query.subjectId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
    };

    const result = await studySessionService.getUserStudySessions(userId, filters);

    res.status(200).json({
      success: true,
      data: result.studySessions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`getUserStudySessions controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Tek bir çalışma kaydını getir
 * GET /api/study-sessions/:id
 */
exports.getStudySessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const studySession = await studySessionService.getStudySessionById(id, userId);

    res.status(200).json({
      success: true,
      data: studySession,
    });
  } catch (error) {
    logger.error(`getStudySessionById controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Çalışma kaydını güncelle
 * PUT /api/study-sessions/:id
 */
exports.updateStudySession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.validatedData;

    const studySession = await studySessionService.updateStudySession(id, userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Çalışma kaydı başarıyla güncellendi',
      data: studySession,
    });
  } catch (error) {
    logger.error(`updateStudySession controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Çalışma kaydını sil
 * DELETE /api/study-sessions/:id
 */
exports.deleteStudySession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await studySessionService.deleteStudySession(id, userId);

    res.status(200).json({
      success: true,
      message: 'Çalışma kaydı başarıyla silindi',
    });
  } catch (error) {
    logger.error(`deleteStudySession controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};