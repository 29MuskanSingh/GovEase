const jwtService = require('../services/jwt.service');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -mfaSecret');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token - user not found' });
    }
    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: `Account is ${user.status}` });
    }
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Administrator access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    next(error);
  }
};

module.exports = authMiddleware;
