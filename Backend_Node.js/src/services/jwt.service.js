const jwt = require('jsonwebtoken');

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '30d';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '365d';

class JWTService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES_IN }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );
  }

  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }

  // Decodes without verifying. Returns null when invalid/expired.
  decode(token) {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }
}

module.exports = new JWTService();
module.exports.ACCESS_EXPIRES_IN = ACCESS_EXPIRES_IN;
module.exports.REFRESH_EXPIRES_IN = REFRESH_EXPIRES_IN;
