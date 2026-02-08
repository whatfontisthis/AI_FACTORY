/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */

const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized - Missing or invalid authorization header'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      firebaseUid: decoded.firebaseUid
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired - Please sign in again'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Invalid token'
      });
    }
    return res.status(500).json({
      error: 'Authentication error'
    });
  }
};

module.exports = { authenticateJWT };
