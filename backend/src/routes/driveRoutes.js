const express = require('express');
const router = express.Router();
const {
  createDrive,
  getAllDrives,
  getDriveById,
  updateDrive,
  updateDriveStatus,
  getEligibleStudentsForDrive,
} = require('../controllers/driveController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

router.get('/', getAllDrives);
router.get('/:id', getDriveById);

router.post('/', authorizeRoles('admin', 'recruiter'), createDrive);
router.put('/:id', authorizeRoles('admin', 'recruiter'), updateDrive);
router.patch('/:id/status', authorizeRoles('admin'), updateDriveStatus);
router.get('/:id/eligible-students', authorizeRoles('admin', 'recruiter'), getEligibleStudentsForDrive);

module.exports = router;
