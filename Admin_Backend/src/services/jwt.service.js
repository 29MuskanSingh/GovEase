const jwt = require('jsonwebtoken');

class JWTService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }
}

module.exports = new JWTService();
