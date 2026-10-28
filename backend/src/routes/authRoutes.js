const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerRecruiter,
  login,
  loginWithGoogle,
  registerGoogleStudent,
  getMe,
  logout,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Public authentication routes
router.post('/register-student', authRateLimiter, registerStudent);
router.post('/register-recruiter', authRateLimiter, registerRecruiter);
router.post('/login', authRateLimiter, login);
router.post('/google/register-student', authRateLimiter, registerGoogleStudent);
router.post('/google', authRateLimiter, loginWithGoogle);
router.post('/firebase-google', authRateLimiter, loginWithGoogle);

// Authenticated session routes
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

module.exports = router;
