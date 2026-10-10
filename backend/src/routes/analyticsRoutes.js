const express = require('express');
const router = express.Router();
const {
  getAdminSummary,
  getDepartmentAnalytics,
  getCompanyAnalytics,
  getRecruiterSummary,
} = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

router.get('/admin-summary', authorizeRoles('admin'), getAdminSummary);
router.get('/department-wise', authorizeRoles('admin'), getDepartmentAnalytics);
router.get('/company-wise', authorizeRoles('admin', 'recruiter'), getCompanyAnalytics);
router.get('/recruiter-summary', authorizeRoles('recruiter'), getRecruiterSummary);

module.exports = router;
