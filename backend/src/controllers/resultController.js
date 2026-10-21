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

/**
 * Get college-specific placement records & real-time selected statistics
 * GET /api/v1/results/college-records
 */
const getCollegePlacementRecords = async (req, res, next) => {
  try {
    let targetCollege = req.query.collegeName;

    // If not specified in query, determine based on authenticated user
    if (!targetCollege) {
      if (req.user.role === 'student') {
        const profile = await StudentProfile.findOne({ userId: req.user._id });
        targetCollege = profile?.collegeName || req.user.collegeName;
      } else {
        targetCollege = req.user.collegeName;
      }
    }

    if (!targetCollege) {
      targetCollege = 'COEP Technological University';
    }

    // Fetch all students belonging to this college
    const allStudents = await StudentProfile.find();
    const collegeStudents = allStudents.filter(
      (s) => (s.collegeName || 'COEP Technological University').trim().toLowerCase() === targetCollege.trim().toLowerCase()
    );
    const collegeStudentIds = new Set(collegeStudents.map((s) => s._id.toString()));

    // Fetch all placement results
    const results = await PlacementResult.find()
      .populate('placementDriveId', 'title jobRole salaryPackage driveDate')
      .populate('companyId', 'name logoUrl industry')
      .populate('studentId', 'collegeId firstName lastName department graduationYear cgpa phone collegeName')
      .sort({ selectionDate: -1 });

    // Filter results for students belonging to this college
    const filteredResults = results.filter((r) => {
      if (!r.studentId) return false;
      const studentObj = r.studentId;
      const studCollege = (studentObj.collegeName || 'COEP Technological University').trim().toLowerCase();
      const studIdStr = (studentObj._id || studentObj).toString();
      return studCollege === targetCollege.trim().toLowerCase() || collegeStudentIds.has(studIdStr);
    });

    const totalPlaced = filteredResults.length;
    let highestSalary = 0;
    let totalSalarySum = 0;
    const companyHiresCount = {};

    filteredResults.forEach((r) => {
      const sal = Number(r.offeredSalary) || 0;
      if (sal > highestSalary) highestSalary = sal;
      totalSalarySum += sal;
      const compName = r.companyId?.name || 'Company Partner';
      companyHiresCount[compName] = (companyHiresCount[compName] || 0) + 1;
    });

    const averageSalary = totalPlaced > 0 ? Math.round(totalSalarySum / totalPlaced) : 0;
    const topRecruiters = Object.entries(companyHiresCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return successResponse(res, 200, `Placement records for ${targetCollege} retrieved.`, {
      collegeName: targetCollege,
      totalStudentsEnrolled: collegeStudents.length,
      totalPlaced,
      placementRate: collegeStudents.length > 0 ? Number(((totalPlaced / collegeStudents.length) * 100).toFixed(1)) : 0,
      highestSalary,
      averageSalary,
      topRecruiters,
      records: filteredResults,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  publishResult,
  getResults,
  getCollegePlacementRecords,
};
