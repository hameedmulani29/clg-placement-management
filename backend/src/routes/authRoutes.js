const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerRecruiter,
  login,
  googleAuth,
  getMe,
  logout,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Public authentication routes
router.post('/register-student', authRateLimiter, registerStudent);
router.post('/register-recruiter', authRateLimiter, registerRecruiter);
router.post('/login', authRateLimiter, login);
router.post('/google', authRateLimiter, googleAuth);
router.post('/firebase-google', authRateLimiter, googleAuth);

// Authenticated session routes
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

module.exports = router;
