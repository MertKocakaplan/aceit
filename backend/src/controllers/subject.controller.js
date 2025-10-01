const subjectService = require('../services/subject.service');
const logger = require('../utils/logger');

/**
 * Kullanıcının derslerini getir
 * GET /api/subjects
 */
exports.getUserSubjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subjects = await subjectService.getUserSubjects(userId);

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    logger.error(`getUserSubjects controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Ders detayını getir
 * GET /api/subjects/:id
 */
exports.getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const subject = await subjectService.getSubjectById(id, userId);

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    logger.error(`getSubjectById controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Dersin konularını getir
 * GET /api/subjects/:id/topics
 */
exports.getSubjectTopics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const topics = await subjectService.getSubjectTopics(id, userId);

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    logger.error(`getSubjectTopics controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};