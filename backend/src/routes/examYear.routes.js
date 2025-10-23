const express = require('express');
const router = express.Router();
const examYearController = require('../controllers/examYear.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Tüm route'lar auth + admin gerektirir
router.use(authenticate, isAdmin);

router.get('/', examYearController.getAllExamYears);
router.get('/:id', examYearController.getExamYearById);
router.post('/', examYearController.createExamYear);
router.put('/:id', examYearController.updateExamYear);
router.patch('/:id/set-active', examYearController.setActiveYear);
router.delete('/:id', examYearController.deleteExamYear);

module.exports = router;