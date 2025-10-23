const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Tüm route'lar auth + admin gerektirir
router.use(authenticate, isAdmin);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/role', userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

module.exports = router;