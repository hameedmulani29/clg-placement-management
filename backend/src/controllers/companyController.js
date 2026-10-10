const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register a new company partner (Admin only)
 * POST /api/v1/companies
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, website, industry, description, logoUrl, contactEmail, contactPhone, address } = req.body;

    if (!name || !industry || !contactEmail) {
      return errorResponse(res, 400, 'Company name, industry sector, and contact email are required.');
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return errorResponse(res, 409, `A company named '${name}' is already registered.`);
    }

    const company = new Company({
      name: name.trim(),
      website: website || '',
      industry: industry.trim(),
      description: description || '',
      logoUrl: logoUrl || '',
      contactEmail: contactEmail.toLowerCase().trim(),
      contactPhone: contactPhone || '',
      address: address || '',
      createdBy: req.user._id,
    });

    await company.save();

    await AuditLog.create({
      action: 'COMPANY_CREATED',
      performedBy: req.user._id,
      targetEntity: 'Company',
      targetEntityId: company._id,
      changes: { name: company.name, industry: company.industry },
      ipAddress: req.ip || '',
    });

    return successResponse(res, 201, 'Company registered successfully.', company);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all companies
 * GET /api/v1/companies
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const { search, industry, isActive } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (industry) {
      query.industry = industry;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { industry: new RegExp(search.trim(), 'i') },
      ];
    }

    const companies = await Company.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Companies retrieved successfully.', companies);
  } catch (error) {
    next(error);
  }
};

/**
 * Get company by ID with its drives
 * GET /api/v1/companies/:id
 */
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return errorResponse(res, 404, 'Company not found.');
    }

    const activeDrives = await PlacementDrive.find({ companyId: company._id }).sort({ createdAt: -1 });

    return successResponse(res, 200, 'Company details retrieved.', {
      company,
      drives: activeDrives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update company details (Admin or Authorized Recruiter)
 * PUT /api/v1/companies/:id
 */
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return errorResponse(res, 404, 'Company not found.');
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, 'Company updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete company (Admin only)
 * DELETE /api/v1/companies/:id
 */
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return errorResponse(res, 404, 'Company not found.');
    }

    await Company.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, `Company '${company.name}' deleted successfully.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
