const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoro.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', pomodoroController.saveSession);
router.get('/stats', pomodoroController.getStats);

module.exports = router;