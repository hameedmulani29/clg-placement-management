const PlacementResult = require('../models/PlacementResult');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Publish final placement result / offer (Admin & Recruiter)
 * POST /api/v1/results
 */
const publishResult = async (req, res, next) => {
  try {
    const { placementDriveId, studentId, companyId, offeredSalary, offerLetterUrl } = req.body;

    if (!placementDriveId || !studentId || !companyId || offeredSalary === undefined) {
      return errorResponse(res, 400, 'Please provide placement drive, student, company, and offered salary.');
    }

    const [drive, student, company] = await Promise.all([
      PlacementDrive.findById(placementDriveId),
      StudentProfile.findById(studentId),
      Company.findById(companyId),
    ]);

    if (!drive || !student || !company) {
      return errorResponse(res, 404, 'Drive, student, or company entity not found.');
    }

    // Upsert placement result
    const result = await PlacementResult.findOneAndUpdate(
      { placementDriveId, studentId },
      {
        companyId,
        offeredSalary: Number(offeredSalary),
        offerLetterUrl: offerLetterUrl || '',
        selectionDate: new Date(),
        status: 'offered',
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Update application status to selected
    await Application.findOneAndUpdate(
      { placementDriveId, studentId },
      { status: 'selected' }
    );

    // Send congratulatory notification to the student
    const formattedSalary = (Number(offeredSalary) / 100000).toFixed(2);
    await Notification.create({
      recipientId: student.userId,
      title: '🎉 Congratulations on Your Job Offer!',
      message: `You have been selected by ${company.name} for the role of ${drive.jobRole} with an annual package of ${formattedSalary} LPA!`,
      type: 'result',
      metadata: { resultId: result._id, driveId: drive._id, salary: offeredSalary },
    });

    // Record audit log
    await AuditLog.create({
      action: 'PLACEMENT_RESULT_PUBLISHED',
      performedBy: req.user._id,
      targetEntity: 'PlacementResult',
      targetEntityId: result._id,
      changes: { student: student.collegeId, company: company.name, offeredSalary },
      ipAddress: req.ip || '',
    });

    return successResponse(res, 201, 'Placement offer recorded successfully.', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get placement results
 * GET /api/v1/results
 */
const getResults = async (req, res, next) => {
  try {
    const { driveId, companyId, studentId } = req.query;
    const query = {};

    if (driveId) query.placementDriveId = driveId;
    if (companyId) query.companyId = companyId;
    if (studentId) query.studentId = studentId;

    const results = await PlacementResult.find(query)
      .populate('placementDriveId', 'title jobRole salaryPackage driveDate')
      .populate('studentId', 'collegeId firstName lastName department graduationYear cgpa phone')
      .populate('companyId', 'name logoUrl industry')
      .sort({ selectionDate: -1 });

    return successResponse(res, 200, 'Placement results retrieved.', results);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  publishResult,
  getResults,
};
