const express = require('express');
const router = express.Router();
const {
  publishResult,
  getResults,
  getCollegePlacementRecords,
} = require('../controllers/resultController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

router.get('/college-records', getCollegePlacementRecords);
router.get('/', getResults);
router.post('/', authorizeRoles('admin', 'recruiter'), publishResult);

module.exports = router;
