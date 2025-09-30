const { verifyToken } = require('../config/jwt');
const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Token doğrulama middleware
 * Authorization header'dan token alır ve doğrular
 */
const authenticate = async (req, res, next) => {
  try {
    // Authorization header'ı kontrol et
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token bulunamadı. Lütfen giriş yapın.',
      });
    }

    // Token'ı al (Bearer kısmını çıkar)
    const token = authHeader.substring(7);

    // Token'ı doğrula
    const decoded = verifyToken(token);

    // Kullanıcıyı veritabanından bul
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        examType: true,
        targetScore: true,
        targetDate: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.',
      });
    }

    // Kullanıcı bilgisini request'e ekle
    req.user = user;
    
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    
    return res.status(401).json({
      success: false,
      message: error.message || 'Kimlik doğrulama başarısız',
    });
  }
};

module.exports = { authenticate };