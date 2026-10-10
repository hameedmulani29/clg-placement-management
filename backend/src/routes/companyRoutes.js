const express = require('express');
const router = express.Router();
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');

router.use(authenticateToken);

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);

router.post('/', authorizeRoles('admin'), createCompany);
router.put('/:id', authorizeRoles('admin', 'recruiter'), updateCompany);
router.delete('/:id', authorizeRoles('admin'), deleteCompany);

module.exports = router;
