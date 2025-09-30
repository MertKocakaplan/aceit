const rateLimit = require('express-rate-limit');

/**
 * Genel API rate limiter
 * Her IP için 15 dakikada 100 istek
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 100 istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
  },
  standardHeaders: true, // Rate limit bilgilerini header'da gönder
  legacyHeaders: false,
});

/**
 * Auth endpoint'leri için özel rate limiter
 * Brute force saldırılarını önlemek için daha sıkı
 * Her IP için 15 dakikada 5 başarısız giriş denemesi
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 5 istek
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Başarılı istekleri sayma
});

module.exports = {
  apiLimiter,
  authLimiter,
};