const express = require('express');
const router = express.Router();
const { uploadResume, getResumeDownloadUrl } = require('../controllers/resumeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { resumeUpload } = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

// Student upload endpoint (Multer memory storage -> S3)
router.post('/upload', authorizeRoles('student'), resumeUpload.single('resume'), uploadResume);

// Authorized view / download endpoint (generates 15-min presigned URL)
router.get('/view/:studentId', getResumeDownloadUrl);

module.exports = router;
