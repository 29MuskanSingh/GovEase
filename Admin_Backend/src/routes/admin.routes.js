const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const userController = require('../controllers/user.controller');
const auditController = require('../controllers/audit.controller');
const contentController = require('../controllers/content.controller');
const formController = require('../controllers/form.controller');
const EligibilityRule = require('../models/eligibilityRule.model');
const Exam = require('../models/exam.model');
const Opportunity = require('../models/opportunity.model');

const router = express.Router();

router.get('/dashboard/metrics', dashboardController.metrics);

router.get('/users', userController.list);
router.get('/users/:id', userController.detail);
router.patch('/users/:id', userController.update);
router.post('/users/:id/reset-password', userController.resetPassword);

router.get('/audit-logs', auditController.list);

router.get('/eligibility-rules', (req, res) => contentController.list(req, res, EligibilityRule));
router.get('/eligibility-rules/:id', (req, res) => contentController.get(req, res, EligibilityRule));
router.post('/eligibility-rules', (req, res) => contentController.create(req, res, EligibilityRule, 'RULE'));
router.patch('/eligibility-rules/:id', (req, res) => contentController.update(req, res, EligibilityRule));
router.delete('/eligibility-rules/:id', (req, res) => contentController.remove(req, res, EligibilityRule, 'eligibility-rule'));

router.get('/exams', (req, res) => contentController.list(req, res, Exam));
router.get('/exams/:id', (req, res) => contentController.get(req, res, Exam));
router.post('/exams', (req, res) => contentController.create(req, res, Exam, 'EXAM'));
router.patch('/exams/:id', (req, res) => contentController.update(req, res, Exam));
router.delete('/exams/:id', (req, res) => contentController.remove(req, res, Exam, 'exam'));

router.get('/opportunities', (req, res) => contentController.list(req, res, Opportunity));
router.get('/opportunities/:id', (req, res) => contentController.get(req, res, Opportunity));
router.post('/opportunities', (req, res) => contentController.create(req, res, Opportunity, 'OPP'));
router.patch('/opportunities/:id', (req, res) => contentController.update(req, res, Opportunity));
router.delete('/opportunities/:id', (req, res) => contentController.remove(req, res, Opportunity, 'opportunity'));

router.get('/forms', formController.list);
router.get('/forms/:id', formController.get);
router.post('/forms', formController.create);
router.patch('/forms/:id', formController.update);
router.delete('/forms/:id', formController.remove);
router.post('/forms/upload-image', formController.uploadImage);

module.exports = router;
