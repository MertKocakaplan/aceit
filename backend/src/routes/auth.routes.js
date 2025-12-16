const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

/**
 * POST /api/auth/register
 * Yeni kullanıcı kaydı
 * Public route (giriş gerektirmez)
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * POST /api/auth/login
 * Kullanıcı girişi
 * Public route
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * POST /api/auth/refresh
 * Access token yenileme
 * Public route (rate limited)
 */
router.post('/refresh', authLimiter, authController.refresh);

/**
 * POST /api/auth/logout
 * Kullanıcı çıkışı
 * Protected route (giriş gerektirir)
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Mevcut kullanıcı bilgisini getir
 * Protected route
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update user profile
 * Protected route
 */
router.put('/profile', authenticate, validateUpdateProfile, authController.updateProfile);

module.exports = router;