const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const PlacementResult = require('../models/PlacementResult');
const RecruiterProfile = require('../models/RecruiterProfile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Admin Executive Placement Summary
 * GET /api/v1/analytics/admin-summary
 */
const getAdminSummary = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalCompanies,
      totalDrives,
      totalApplications,
      distinctSelectedStudents,
      salaryStats,
      activeDrivesCount,
    ] = await Promise.all([
      StudentProfile.countDocuments(),
      Company.countDocuments({ isActive: true }),
      PlacementDrive.countDocuments(),
      Application.countDocuments(),
      Application.distinct('studentId', { status: 'selected' }),
      PlacementResult.aggregate([
        {
          $group: {
            _id: null,
            averageSalary: { $avg: '$offeredSalary' },
            highestSalary: { $max: '$offeredSalary' },
            lowestSalary: { $min: '$offeredSalary' },
            totalOffers: { $sum: 1 },
          },
        },
      ]),
      PlacementDrive.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } }),
    ]);

    const totalSelected = distinctSelectedStudents.length;
    // Placement Percentage: Calculated over unique registered students, not raw applications
    const placementRate = totalStudents > 0 ? Number(((totalSelected / totalStudents) * 100).toFixed(2)) : 0;

    const stats = salaryStats[0] || {
      averageSalary: 0,
      highestSalary: 0,
      lowestSalary: 0,
      totalOffers: 0,
    };

    return successResponse(res, 200, 'Placement summary analytics retrieved.', {
      totalStudents,
      totalCompanies,
      totalDrives,
      activeDrivesCount,
      totalApplications,
      totalSelectedStudents: totalSelected,
      placementRate,
      salaryStatistics: {
        averageSalary: Math.round(stats.averageSalary),
        highestSalary: stats.highestSalary,
        lowestSalary: stats.lowestSalary,
        totalOffersCount: stats.totalOffers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Department-wise Placement Breakdown
 * GET /api/v1/analytics/department-wise
 */
const getDepartmentAnalytics = async (req, res, next) => {
  try {
    // 1. Group all students by department
    const studentDeptDistribution = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 },
          averageCgpa: { $avg: '$cgpa' },
        },
      },
    ]);

    // 2. Group placed students by department
    const placedStudents = await Application.find({ status: 'selected' })
      .populate('studentId', 'department')
      .select('studentId');

    const placedDeptCount = {};
    const placedStudentIds = new Set();

    placedStudents.forEach((app) => {
      if (app.studentId && !placedStudentIds.has(app.studentId._id.toString())) {
        placedStudentIds.add(app.studentId._id.toString());
        const dept = app.studentId.department;
        placedDeptCount[dept] = (placedDeptCount[dept] || 0) + 1;
      }
    });

    const report = studentDeptDistribution.map((item) => {
      const department = item._id;
      const total = item.totalStudents;
      const placed = placedDeptCount[department] || 0;
      const percentage = total > 0 ? Number(((placed / total) * 100).toFixed(1)) : 0;

      return {
        department,
        totalStudents: total,
        placedStudents: placed,
        placementPercentage: percentage,
        averageCgpa: Number(item.averageCgpa.toFixed(2)),
      };
    });

    return successResponse(res, 200, 'Department analytics calculated.', report);
  } catch (error) {
    next(error);
  }
};

/**
 * Company-wise Recruitment Distribution
 * GET /api/v1/analytics/company-wise
 */
const getCompanyAnalytics = async (req, res, next) => {
  try {
    const results = await PlacementResult.aggregate([
      {
        $group: {
          _id: '$companyId',
          totalHires: { $sum: 1 },
          averagePackage: { $avg: '$offeredSalary' },
          maxPackage: { $max: '$offeredSalary' },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $project: {
          companyId: '$_id',
          companyName: '$company.name',
          industry: '$company.industry',
          totalHires: 1,
          averagePackage: { $round: ['$averagePackage', 0] },
          maxPackage: 1,
        },
      },
      { $sort: { totalHires: -1 } },
    ]);

    return successResponse(res, 200, 'Company recruitment analytics retrieved.', results);
  } catch (error) {
    next(error);
  }
};

/**
 * Recruiter Portal Summary Analytics
 * GET /api/v1/analytics/recruiter-summary
 */
const getRecruiterSummary = async (req, res, next) => {
  try {
    const recruiter = await RecruiterProfile.findOne({ userId: req.user._id });
    if (!recruiter) {
      return errorResponse(res, 403, 'Recruiter profile not found.');
    }

    const companyDrives = await PlacementDrive.find({ companyId: recruiter.companyId });
    const driveIds = companyDrives.map((d) => d._id);

    const [totalApps, shortlisted, interviewScheduled, selected, rejected] = await Promise.all([
      Application.countDocuments({ placementDriveId: { $in: driveIds } }),
      Application.countDocuments({ placementDriveId: { $in: driveIds }, status: 'shortlisted' }),
      Application.countDocuments({ placementDriveId: { $in: driveIds }, status: 'interview_scheduled' }),
      Application.countDocuments({ placementDriveId: { $in: driveIds }, status: 'selected' }),
      Application.countDocuments({ placementDriveId: { $in: driveIds }, status: 'rejected' }),
    ]);

    return successResponse(res, 200, 'Recruiter summary retrieved.', {
      activeDrivesCount: companyDrives.length,
      pipeline: {
        totalApplications: totalApps,
        applied: totalApps - (shortlisted + interviewScheduled + selected + rejected),
        shortlisted,
        interviewScheduled,
        selected,
        rejected,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminSummary,
  getDepartmentAnalytics,
  getCompanyAnalytics,
  getRecruiterSummary,
};
