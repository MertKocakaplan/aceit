const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

router.use(authenticate, isAdmin);

router.get('/', userController.getAdminStats);

module.exports = router;