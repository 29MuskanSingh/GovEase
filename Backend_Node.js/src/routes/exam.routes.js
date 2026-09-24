const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', examController.listExams);
router.get('/:id', examController.getExam);
router.get('/:id/form', authMiddleware, examController.getExamForm);

module.exports = router;
