const logger = require('../utils/logger');

/**
 * Admin yetkisi kontrolü
 * Sadece ADMIN rolüne sahip kullanıcılar geçebilir
 */
const isAdmin = (req, res, next) => {
  try {
    // auth middleware'den gelen user bilgisi
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulaması gerekli',
      });
    }

    // Role kontrolü
    if (req.user.role !== 'ADMIN') {
      logger.warn(`Admin erişim reddedildi: ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekli',
      });
    }

    // Admin ise devam et
    next();
  } catch (error) {
    logger.error(`Admin middleware error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Yetki kontrolü sırasında hata oluştu',
    });
  }
};

module.exports = { isAdmin };