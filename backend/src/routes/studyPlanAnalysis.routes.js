const express = require('express');
const router = express.Router();
const studyPlanAnalysisController = require('../controllers/studyPlanAnalysis.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/analysis', studyPlanAnalysisController.getUserAnalysis);

module.exports = router;