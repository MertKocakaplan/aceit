const express = require('express');
const router = express.Router();
const topicQuestionCountController = require('../controllers/topicQuestionCount.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Tüm route'lar auth + admin gerektirir
router.use(authenticate, isAdmin);

router.get('/', topicQuestionCountController.getByExamYear);
router.get('/by-topic/:topicId', topicQuestionCountController.getByTopic);
router.post('/bulk', topicQuestionCountController.upsertBulk);
router.put('/', topicQuestionCountController.upsert);
router.delete('/:id', topicQuestionCountController.deleteCount);
router.post('/upload-csv', topicQuestionCountController.uploadCSV);

module.exports = router;