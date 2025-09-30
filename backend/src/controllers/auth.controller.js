const authService = require('../services/auth.service');
const { verifyToken, generateToken } = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Kullanıcı kayıt (Register)
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const userData = req.validatedData;

    // Kullanıcı oluştur
    const user = await authService.createUser(userData);

    // Token oluştur
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı! Hoş geldiniz.',
      data: {
        user,
        token: accessToken,
      },
    });
  } catch (error) {
    logger.error(`Register controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Kullanıcı girişi (Login)
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.validatedData;

    // Giriş yap
    const result = await authService.loginUser(identifier, password);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      data: result,
    });
  } catch (error) {
    logger.error(`Login controller error: ${error.message}`);
    error.statusCode = 401;
    next(error);
  }
};

/**
 * Token yenileme (Refresh)
 * POST /api/auth/refresh
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const error = new Error('Refresh token bulunamadı');
      error.statusCode = 401;
      throw error;
    }

    // Refresh token'ı doğrula
    const decoded = verifyToken(refreshToken);

    // Kullanıcıyı kontrol et
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      const error = new Error('Kullanıcı bulunamadı');
      error.statusCode = 401;
      throw error;
    }

    // Yeni access token oluştur
    const newAccessToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Token yenilendi',
      data: {
        token: newAccessToken,
      },
    });
  } catch (error) {
    logger.error(`Refresh controller error: ${error.message}`);
    error.statusCode = 401;
    next(error);
  }
};

/**
 * Çıkış yap (Logout)
 * POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    // Client tarafında token silinecek
    // Burada sadece log tutuyoruz
    logger.info(`Kullanıcı çıkış yaptı: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı',
    });
  } catch (error) {
    logger.error(`Logout controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Mevcut kullanıcı bilgisini getir
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // req.user zaten auth middleware'den geliyor
    const user = await authService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error(`getCurrentUser controller error: ${error.message}`);
    next(error);
  }
};