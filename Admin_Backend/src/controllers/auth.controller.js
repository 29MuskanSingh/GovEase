const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');
const jwtService = require('../services/jwt.service');
const { logAudit } = require('../services/audit.service');

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

const serializeUser = (user) => {
  const data = user.toObject ? user.toObject() : user;
  const { password, mfaSecret, ...safeUser } = data;
  return safeUser;
};

class AuthController {
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user || req.body.password !== user.password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      if (user.status !== 'Active') {
        return res.status(403).json({ success: false, message: `Account is ${user.status}` });
      }
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Administrator access required' });
      }

      await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
      const safeUser = serializeUser(user);
      await logAudit(req, 'ADMIN_LOGIN', 'user', user._id, { email: user.email });

      res.json({
        success: true,
        message: 'Login successful',
        accessToken: jwtService.generateAccessToken(user),
        refreshToken: jwtService.generateRefreshToken(user),
        user: safeUser
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async refresh(req, res) {
    try {
      const decoded = jwtService.verifyRefreshToken(req.body.refreshToken);
      const user = await User.findById(decoded.userId).select('-password -mfaSecret');
      if (!user || user.status !== 'Active' || user.role !== 'ADMIN') {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }
      res.json({ success: true, accessToken: jwtService.generateAccessToken(user) });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  }

  async me(req, res) {
    res.json({ success: true, user: serializeUser(req.user) });
  }

  async logout(req, res) {
    await logAudit(req, 'ADMIN_LOGOUT', 'session', null);
    res.json({ success: true, message: 'Logout successful' });
  }

  async changePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user || req.body.currentPassword !== user.password) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      await User.updateOne(
        { _id: user._id },
        { $set: { password: req.body.newPassword, passwordChangeRequired: false, lastPasswordResetAt: new Date() } }
      );
      await logAudit(req, 'PASSWORD_CHANGED', 'user', user._id);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
module.exports.loginValidation = loginValidation;
module.exports.changePasswordValidation = changePasswordValidation;
