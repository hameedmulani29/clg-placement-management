const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudentByAdmin,
  deleteStudentByAdmin,
} = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

// All student endpoints require active authentication
router.use(authenticateToken);

// Current student self-profile routes
router.get('/me', authorizeRoles('student'), getMyProfile);
router.put('/me', authorizeRoles('student'), updateMyProfile);

// Admin & Recruiter listing route
router.get('/', authorizeRoles('admin', 'recruiter'), getAllStudents);

// Student detail view (Admin, Recruiter, or Self)
router.get('/:id', getStudentById);

// Admin exclusive modification and deletion routes
router.put('/:id', authorizeRoles('admin'), updateStudentByAdmin);
router.delete('/:id', authorizeRoles('admin'), deleteStudentByAdmin);

module.exports = router;
