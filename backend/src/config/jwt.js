const jwt = require('jsonwebtoken');

/**
 * JWT token oluştur
 * @param {Object} payload - Token içeriği (userId, email)
 * @param {String} expiresIn - Token süresi (ör: '7d', '1h')
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

/**
 * JWT token doğrula
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} Token geçersizse hata fırlatır
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token süresi dolmuş');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Geçersiz token');
    }
    throw new Error('Token doğrulama hatası');
  }
};

/**
 * Refresh token oluştur
 * @param {Object} payload - Token içeriği
 * @returns {String} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
};