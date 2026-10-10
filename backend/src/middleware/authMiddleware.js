const { verifyToken } = require('../utils/jwtHelper');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Authentication Middleware: Validates Bearer JWT in HTTP Authorization Header
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. Missing or malformed Authorization header.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 401, 'Access denied. Bearer token not provided.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Authentication token has expired. Please log in again.');
      }
      return errorResponse(res, 401, 'Invalid authentication token.');
    }

    // Verify user exists and is active in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'User account associated with this token no longer exists.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact the administrator.');
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error]: ${error.message}`);
    return errorResponse(res, 500, 'Authentication verification failure.');
  }
};

module.exports = {
  authenticateToken,
};
