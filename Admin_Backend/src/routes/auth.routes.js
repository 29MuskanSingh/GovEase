const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', authController.loginValidation, authController.login);
router.post('/refresh', authController.refresh);

router.use(authMiddleware);
router.get('/me', authController.me);
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePasswordValidation, authController.changePassword);

module.exports = router;
