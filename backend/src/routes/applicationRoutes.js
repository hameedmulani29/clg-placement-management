const express = require('express');
const router = express.Router();
const {
  applyToDrive,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

// Student apply and view own applications
router.post('/', authorizeRoles('student'), applyToDrive);
router.get('/my-applications', authorizeRoles('student'), getMyApplications);

// Admin & Recruiter list applications
router.get('/', authorizeRoles('admin', 'recruiter'), getAllApplications);

// Single application details
router.get('/:id', getApplicationById);

// Update status (Admin or Recruiter)
router.patch('/:id/status', authorizeRoles('admin', 'recruiter'), updateApplicationStatus);

module.exports = router;
