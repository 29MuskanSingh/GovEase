const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunity.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', opportunityController.listOpportunities);
router.get('/:id', opportunityController.getOpportunity);
router.get('/:id/form', authMiddleware, opportunityController.getOpportunityForm);

module.exports = router;
