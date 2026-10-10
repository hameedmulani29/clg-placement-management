const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { checkEligibility } = require('../services/eligibilityService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * Apply to a placement drive (Student only)
 * POST /api/v1/applications
 */
const applyToDrive = async (req, res, next) => {
  try {
    const { placementDriveId } = req.body;

    if (!placementDriveId) {
      return errorResponse(res, 400, 'Placement drive ID is required.');
    }

    // 1. Locate student profile
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return errorResponse(res, 404, 'Student profile not found. Complete your profile before applying.');
    }

    // 2. Locate target placement drive
    const drive = await PlacementDrive.findById(placementDriveId).populate('companyId', 'name');
    if (!drive) {
      return errorResponse(res, 404, 'Target placement drive does not exist.');
    }

    // 3. Strict Backend Eligibility Check (Never trust frontend validation)
    const eligibilityResult = checkEligibility(studentProfile, drive);
    if (!eligibilityResult.isEligible) {
      return errorResponse(
        res,
        400,
        'Application rejected: You do not meet the eligibility requirements for this drive.',
        eligibilityResult.reasons
      );
    }

    // 4. Check for duplicate application
    const existingApp = await Application.findOne({
      placementDriveId: drive._id,
      studentId: studentProfile._id,
    });
    if (existingApp) {
      return errorResponse(res, 409, 'You have already submitted an application for this placement drive.');
    }

    // 5. Create application record
    const application = new Application({
      placementDriveId: drive._id,
      studentId: studentProfile._id,
      status: 'applied',
      currentRound: 1,
      resumeSnapshotKey: studentProfile.resumeS3Key,
    });

    await application.save();

    // 6. Notify student of successful submission
    await Notification.create({
      recipientId: req.user._id,
      title: 'Application Submitted',
      message: `Your application for ${drive.jobRole} at ${drive.companyId.name} has been received.`,
      type: 'application',
      metadata: { applicationId: application._id, driveId: drive._id },
    });

    const populatedApp = await Application.findById(application._id)
      .populate('placementDriveId')
      .populate('studentId');

    return successResponse(res, 201, 'Application submitted successfully!', populatedApp);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current student's applications
 * GET /api/v1/applications/my-applications
 */
const getMyApplications = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return errorResponse(res, 404, 'Student profile not found.');
    }

    const applications = await Application.find({ studentId: studentProfile._id })
      .populate({
        path: 'placementDriveId',
        populate: { path: 'companyId', select: 'name logoUrl industry' },
      })
      .sort({ appliedDate: -1 });

    return successResponse(res, 200, 'Applications retrieved successfully.', applications);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications with filters (Admin & Recruiter)
 * GET /api/v1/applications
 */
const getAllApplications = async (req, res, next) => {
  try {
    const { driveId, status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (driveId) query.placementDriveId = driveId;
    if (status) query.status = status;

    // If recruiter, restrict to their authorized company drives
    if (req.user.role === 'recruiter') {
      const recruiter = await RecruiterProfile.findOne({ userId: req.user._id });
      if (!recruiter) {
        return errorResponse(res, 403, 'Recruiter profile not found.');
      }
      const companyDrives = await PlacementDrive.find({ companyId: recruiter.companyId }).select('_id');
      const companyDriveIds = companyDrives.map((d) => d._id);

      if (query.placementDriveId) {
        if (!companyDriveIds.some((id) => id.toString() === query.placementDriveId.toString())) {
          return errorResponse(res, 403, 'Forbidden: You can only view applications for your company’s drives.');
        }
      } else {
        query.placementDriveId = { $in: companyDriveIds };
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'placementDriveId',
          populate: { path: 'companyId', select: 'name logoUrl industry' },
        })
        .populate('studentId')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(query),
    ]);

    return paginatedResponse(res, applications, pageNum, limitNum, total, 'Applications retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single application by ID
 * GET /api/v1/applications/:id
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'placementDriveId',
        populate: { path: 'companyId', select: 'name logoUrl industry website' },
      })
      .populate('studentId');

    if (!application) {
      return errorResponse(res, 404, 'Application not found.');
    }

    // Role security check: student can only view their own application
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (!studentProfile || application.studentId._id.toString() !== studentProfile._id.toString()) {
        return errorResponse(res, 403, 'Forbidden: You cannot view another student’s application.');
      }
    }

    return successResponse(res, 200, 'Application details retrieved.', application);
  } catch (error) {
    next(error);
  }
};

/**
 * Update candidate application status (Shortlist, Reject, Select, Advance Round)
 * PATCH /api/v1/applications/:id/status
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, currentRound, notes } = req.body;

    const validStatuses = ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Valid values: [${validStatuses.join(', ')}]`);
    }

    const application = await Application.findById(req.params.id)
      .populate('placementDriveId')
      .populate('studentId');

    if (!application) {
      return errorResponse(res, 404, 'Application not found.');
    }

    // If recruiter, ensure drive belongs to their company
    if (req.user.role === 'recruiter') {
      const recruiter = await RecruiterProfile.findOne({ userId: req.user._id });
      if (!recruiter || application.placementDriveId.companyId.toString() !== recruiter.companyId.toString()) {
        return errorResponse(res, 403, 'Forbidden: You can only update applications for your company.');
      }
    }

    if (status) application.status = status;
    if (currentRound !== undefined) application.currentRound = Number(currentRound);
    if (notes !== undefined) application.notes = notes;

    await application.save();

    // Send notification to the student about status change
    await Notification.create({
      recipientId: application.studentId.userId,
      title: `Application Status Updated: ${status.toUpperCase()}`,
      message: `Your application status for '${application.placementDriveId.title}' is now: ${status.replace('_', ' ').toUpperCase()}.`,
      type: 'application',
      metadata: { applicationId: application._id, newStatus: status },
    });

    // Audit log
    await AuditLog.create({
      action: 'APPLICATION_STATUS_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'Application',
      targetEntityId: application._id,
      changes: { newStatus: status, round: application.currentRound, notes },
      ipAddress: req.ip || '',
    });

    return successResponse(res, 200, 'Application status updated successfully.', application);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToDrive,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
};
