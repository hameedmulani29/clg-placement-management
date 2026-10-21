const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { checkEligibility } = require('../services/eligibilityService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * Create a new placement drive (Admin or Recruiter)
 * POST /api/v1/drives
 */
const createDrive = async (req, res, next) => {
  try {
    const {
      title,
      companyId,
      jobRole,
      jobDescription,
      jobLocations,
      salaryPackage,
      eligibilityCriteria,
      collegeSpecificCriteria,
      selectionRounds,
      applicationDeadline,
      driveDate,
    } = req.body;

    if (!title || !companyId || !jobRole || !jobDescription || !salaryPackage || !eligibilityCriteria || !applicationDeadline || !driveDate) {
      return errorResponse(res, 400, 'Please provide all required placement drive configuration fields.');
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, 404, 'Selected company does not exist.');
    }

    const drive = new PlacementDrive({
      title,
      companyId,
      jobRole,
      jobDescription,
      jobLocations: Array.isArray(jobLocations) ? jobLocations : ['Bangalore'],
      salaryPackage,
      eligibilityCriteria,
      collegeSpecificCriteria: Array.isArray(collegeSpecificCriteria) ? collegeSpecificCriteria : [],
      selectionRounds: Array.isArray(selectionRounds) ? selectionRounds : undefined,
      applicationDeadline: new Date(applicationDeadline),
      driveDate: new Date(driveDate),
      createdBy: req.user._id,
    });

    await drive.save();

    // Notify institutional TPO administrators of selected target colleges
    if (Array.isArray(collegeSpecificCriteria) && collegeSpecificCriteria.length > 0) {
      const adminUsers = await User.find({ role: 'admin' });
      for (const crit of collegeSpecificCriteria) {
        if (!crit.collegeName) continue;
        const matchingAdmins = adminUsers.filter(
          (a) => !a.collegeName || a.collegeName.toLowerCase() === crit.collegeName.toLowerCase()
        );
        const recipients = matchingAdmins.length > 0 ? matchingAdmins : adminUsers;
        for (const admin of recipients) {
          await Notification.create({
            recipientId: admin._id,
            title: `🎯 ${company.name} Selected ${crit.collegeName} for Placement Drive`,
            message: `${company.name} has scheduled "${jobRole}" with targeted criteria for ${crit.collegeName}: Min CGPA ${crit.minCgpa ?? 'N/A'}, Allowed Branches: [${(crit.allowedDepartments || []).join(', ')}].`,
            type: 'drive',
            metadata: {
              driveId: drive._id,
              collegeName: crit.collegeName,
              criteria: crit,
            },
          }).catch(() => {});
        }
      }
    }

    await AuditLog.create({
      action: 'DRIVE_CREATED',
      performedBy: req.user._id,
      targetEntity: 'PlacementDrive',
      targetEntityId: drive._id,
      changes: { title: drive.title, company: company.name, collegeCriteriaCount: collegeSpecificCriteria?.length || 0 },
      ipAddress: req.ip || '',
    });

    const populatedDrive = await PlacementDrive.findById(drive._id).populate('companyId', 'name logoUrl industry website');

    return successResponse(res, 201, 'Placement drive created successfully.', populatedDrive);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all placement drives with filtering and pagination
 * GET /api/v1/drives
 */
const getAllDrives = async (req, res, next) => {
  try {
    const { status, companyId, department, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (companyId) query.companyId = companyId;

    if (department) {
      query['eligibilityCriteria.allowedDepartments'] = department;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { jobRole: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [drives, total] = await Promise.all([
      PlacementDrive.find(query)
        .populate('companyId', 'name logoUrl industry website')
        .sort({ driveDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      PlacementDrive.countDocuments(query),
    ]);

    // If student requested, enrich with application and eligibility flags
    let studentProfile = null;
    let appliedDriveIds = new Set();

    if (req.user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (studentProfile) {
        const studentApps = await Application.find({ studentId: studentProfile._id }).select('placementDriveId');
        appliedDriveIds = new Set(studentApps.map((a) => a.placementDriveId.toString()));
      }
    }

    const formattedDrives = drives.map((driveDoc) => {
      const drive = driveDoc.toObject();
      if (req.user.role === 'student' && studentProfile) {
        const { isEligible, reasons } = checkEligibility(studentProfile, driveDoc);
        drive.eligibility = { isEligible, reasons };
        drive.hasApplied = appliedDriveIds.has(drive._id.toString());
      }
      return drive;
    });

    return paginatedResponse(res, formattedDrives, pageNum, limitNum, total, 'Placement drives retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get placement drive by ID (Includes eligibility check & application status for students)
 * GET /api/v1/drives/:id
 */
const getDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('companyId', 'name logoUrl industry website address contactEmail');

    if (!drive) {
      return errorResponse(res, 404, 'Placement drive not found.');
    }

    const responsePayload = {
      drive,
      eligibility: null,
      userApplication: null,
    };

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (studentProfile) {
        const eligibilityResult = checkEligibility(studentProfile, drive);
        responsePayload.eligibility = eligibilityResult;

        const application = await Application.findOne({
          placementDriveId: drive._id,
          studentId: studentProfile._id,
        });
        responsePayload.userApplication = application;
      }
    }

    return successResponse(res, 200, 'Placement drive details retrieved.', responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * Update placement drive
 * PUT /api/v1/drives/:id
 */
const updateDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return errorResponse(res, 404, 'Placement drive not found.');
    }

    const updated = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('companyId', 'name logoUrl industry');

    return successResponse(res, 200, 'Placement drive updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Update drive status (upcoming -> ongoing -> completed -> cancelled)
 * PATCH /api/v1/drives/:id/status
 */
const updateDriveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return errorResponse(res, 400, 'Invalid status value provided.');
    }

    const drive = await PlacementDrive.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('companyId', 'name logoUrl');

    if (!drive) {
      return errorResponse(res, 404, 'Placement drive not found.');
    }

    await AuditLog.create({
      action: 'DRIVE_STATUS_CHANGED',
      performedBy: req.user._id,
      targetEntity: 'PlacementDrive',
      targetEntityId: drive._id,
      changes: { newStatus: status },
      ipAddress: req.ip || '',
    });

    return successResponse(res, 200, `Drive status changed to ${status}.`, drive);
  } catch (error) {
    next(error);
  }
};

/**
 * Get eligible and ineligible student pools for a specific drive (Admin & Recruiter)
 * GET /api/v1/drives/:id/eligible-students
 */
const getEligibleStudentsForDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return errorResponse(res, 404, 'Placement drive not found.');
    }

    const allStudents = await StudentProfile.find().populate('userId', 'email isActive');

    const eligible = [];
    const ineligible = [];

    allStudents.forEach((student) => {
      const evaluation = checkEligibility(student, drive);
      if (evaluation.isEligible) {
        eligible.push(student);
      } else {
        ineligible.push({
          student,
          reasons: evaluation.reasons,
        });
      }
    });

    return successResponse(res, 200, 'Eligible candidates evaluated successfully.', {
      driveId: drive._id,
      totalStudentsEvaluated: allStudents.length,
      eligibleCount: eligible.length,
      ineligibleCount: ineligible.length,
      eligibleStudents: eligible,
      ineligibleStudents: ineligible,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDrive,
  getAllDrives,
  getDriveById,
  updateDrive,
  updateDriveStatus,
  getEligibleStudentsForDrive,
};
