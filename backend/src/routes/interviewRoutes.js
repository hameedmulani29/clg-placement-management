const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getMyInterviews,
  updateInterview,
} = require('../controllers/interviewController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

router.post('/', authorizeRoles('admin', 'recruiter'), scheduleInterview);
router.get('/my-schedule', authorizeRoles('student'), getMyInterviews);
router.patch('/:id', authorizeRoles('admin', 'recruiter'), updateInterview);

module.exports = router;
