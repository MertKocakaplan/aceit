const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * Tüm kullanıcıları listele
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      role: req.query.role,
      examType: req.query.examType,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await authService.getAllUsers(filters);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`getAllUsers controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Kullanıcı detayı
 * GET /api/admin/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`getUserById controller error: ${error.message}`);
    error.statusCode = 404;
    next(error);
  }
};

/**
 * Kullanıcı rolü güncelle
 * PATCH /api/admin/users/:id/role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir rol belirtin (USER veya ADMIN)',
      });
    }

    const user = await authService.updateUserRole(id, role);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı rolü güncellendi',
      data: user,
    });
  } catch (error) {
    logger.error(`updateUserRole controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Kullanıcı sil
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kendini silmeyi engelle
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz',
      });
    }

    await authService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı silindi',
    });
  } catch (error) {
    logger.error(`deleteUser controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Admin istatistikleri
 * GET /api/admin/stats
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const stats = await authService.getAdminStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`getAdminStats controller error: ${error.message}`);
    next(error);
  }
};