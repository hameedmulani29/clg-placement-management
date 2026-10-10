const express = require('express');
const router = express.Router();
const { exportPlacementReportCSV } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

router.get('/export-csv', authorizeRoles('admin'), exportPlacementReportCSV);

module.exports = router;
