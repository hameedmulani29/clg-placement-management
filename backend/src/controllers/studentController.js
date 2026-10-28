const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

const STUDENT_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const STUDENT_COLLEGES = [
  'COEP Technological University',
  'MIT World Peace University',
  'VJTI Mumbai',
  'Sardar Patel Institute of Technology (SPIT)',
  'Pune Institute of Computer Technology (PICT)',
  'IIT Bombay',
  'BITS Pilani',
  'Delhi Technological University (DTU)',
  'NIT Trichy',
  'College of Engineering Guindy (Anna University)',
  'Thapar Institute of Engineering and Technology',
  'Manipal Institute of Technology',
];

/**
 * Get current student's own private profile
 * GET /api/v1/students/me
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'email role isActive createdAt');

    if (!profile) {
      return errorResponse(res, 404, 'Student profile not found for the authenticated user.');
    }

    return successResponse(res, 200, 'Student profile retrieved successfully.', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Create an incomplete Google student's profile or update editable profile fields.
 * PUT /api/v1/students/me
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const {
      collegeId,
      collegeName,
      firstName,
      lastName,
      department,
      graduationYear,
      cgpa,
      activeBacklogs,
      phone,
      skills,
      certifications,
      projects,
    } = req.body;

    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      const requiredFields = {
        collegeId,
        collegeName,
        department,
        graduationYear,
        cgpa,
        activeBacklogs,
        phone,
      };
      const missingFields = Object.entries(requiredFields)
        .filter(([, value]) => value === undefined || value === null || String(value).trim() === '')
        .map(([field]) => field);

      if (missingFields.length) {
        return errorResponse(
          res,
          400,
          `Complete all required profile fields: ${missingFields.join(', ')}.`
        );
      }

      const normalizedCollegeId = String(collegeId).trim().toUpperCase();
      const parsedGraduationYear = Number(graduationYear);
      const parsedCgpa = Number(cgpa);
      const parsedBacklogs = Number(activeBacklogs);
      if (!Number.isInteger(parsedGraduationYear) || parsedGraduationYear < 1900) {
        return errorResponse(res, 400, 'Enter a valid graduation year.');
      }
      if (!Number.isFinite(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
        return errorResponse(res, 400, 'CGPA must be between 0 and 10.');
      }
      if (!Number.isInteger(parsedBacklogs) || parsedBacklogs < 0) {
        return errorResponse(res, 400, 'Active backlogs must be zero or a positive whole number.');
      }
      if (!STUDENT_DEPARTMENTS.includes(department)) {
        return errorResponse(res, 400, 'Select a valid academic department.');
      }
      if (!STUDENT_COLLEGES.includes(collegeName)) {
        return errorResponse(res, 400, 'Select a valid college or university.');
      }
      if (!/^\+91\d{10}$/.test(phone)) {
        return errorResponse(res, 400, 'Enter a valid 10-digit Indian mobile number with the +91 country code.');
      }
      if (await StudentProfile.findOne({ collegeId: normalizedCollegeId })) {
        return errorResponse(res, 409, 'That student ID is already registered. Enter your own unique student ID.');
      }

      const googleName = String(req.user.displayName || '').trim();
      const nameParts = googleName ? googleName.split(/\s+/) : [];
      const firstNameFromGoogle = nameParts[0] || String(req.user.email || '').split('@')[0];
      const lastNameFromGoogle = nameParts.slice(1).join(' ') || 'Student';
      profile = new StudentProfile({
        userId: req.user._id,
        collegeId: normalizedCollegeId,
        collegeName: typeof collegeName === 'string' ? collegeName.trim() : '',
        firstName: firstNameFromGoogle,
        lastName: lastNameFromGoogle,
        department: String(department).trim(),
        graduationYear: parsedGraduationYear,
        cgpa: parsedCgpa,
        activeBacklogs: parsedBacklogs,
        phone: typeof phone === 'string' ? phone.trim() : '',
        skills: Array.isArray(skills) ? skills : [],
        certifications: Array.isArray(certifications) ? certifications : [],
        projects: Array.isArray(projects) ? projects : [],
      });
      await profile.save();
      return successResponse(res, 201, 'Student profile completed successfully.', profile);
    }

    if (phone) profile.phone = phone.trim();
    if (skills) {
      profile.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (certifications && Array.isArray(certifications)) {
      profile.certifications = certifications;
    }
    if (projects && Array.isArray(projects)) {
      profile.projects = projects;
    }

    await profile.save();

    return successResponse(res, 200, 'Profile updated successfully.', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all students (Admin / Recruiter only) with search, filtering, and pagination
 * GET /api/v1/students
 */
const getAllStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department,
      graduationYear,
      minCgpa,
      maxBacklogs,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by graduation year
    if (graduationYear) {
      query.graduationYear = Number(graduationYear);
    }

    // Filter by minimum CGPA
    if (minCgpa) {
      query.cgpa = { $gte: Number(minCgpa) };
    }

    // Filter by maximum active backlogs
    if (maxBacklogs !== undefined && maxBacklogs !== '') {
      query.activeBacklogs = { $lte: Number(maxBacklogs) };
    }

    // Search query on firstName, lastName, collegeId, or skills
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { collegeId: searchRegex },
        { skills: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [profiles, total] = await Promise.all([
      StudentProfile.find(query)
        .populate('userId', 'email isActive createdAt')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      StudentProfile.countDocuments(query),
    ]);

    return paginatedResponse(res, profiles, pageNum, limitNum, total, 'Students retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by ID (Admin, Recruiter, or Self)
 * GET /api/v1/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id).populate('userId', 'email isActive createdAt');

    if (!profile) {
      return errorResponse(res, 404, 'Student record not found.');
    }

    // If user is a student, ensure they are requesting their own record
    if (req.user.role === 'student' && profile.userId._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Forbidden: You are not authorized to view other students’ private profiles.');
    }

    return successResponse(res, 200, 'Student details retrieved successfully.', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Administrative update of academic records (Admin only)
 * PUT /api/v1/students/:id
 */
const updateStudentByAdmin = async (req, res, next) => {
  try {
    const { department, graduationYear, cgpa, activeBacklogs, isActive, phone } = req.body;

    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return errorResponse(res, 404, 'Student profile not found.');
    }

    const previousData = {
      department: profile.department,
      graduationYear: profile.graduationYear,
      cgpa: profile.cgpa,
      activeBacklogs: profile.activeBacklogs,
    };

    if (department) profile.department = department;
    if (graduationYear) profile.graduationYear = Number(graduationYear);
    if (cgpa !== undefined) profile.cgpa = Number(cgpa);
    if (activeBacklogs !== undefined) profile.activeBacklogs = Number(activeBacklogs);
    if (phone) profile.phone = phone;

    await profile.save();

    // If isActive flag provided, update User document
    if (isActive !== undefined) {
      await User.findByIdAndUpdate(profile.userId, { isActive: Boolean(isActive) });
    }

    // Record audit log
    await AuditLog.create({
      action: 'ADMIN_STUDENT_PROFILE_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'StudentProfile',
      targetEntityId: profile._id,
      changes: { before: previousData, after: req.body },
      ipAddress: req.ip || '',
    });

    return successResponse(res, 200, 'Student record updated by administrator.', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Administrative deletion of student record (Admin only)
 * DELETE /api/v1/students/:id
 */
const deleteStudentByAdmin = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return errorResponse(res, 404, 'Student record not found.');
    }

    // Delete associated User account
    await User.findByIdAndDelete(profile.userId);

    // Delete profile
    await StudentProfile.findByIdAndDelete(profile._id);

    // Record audit log
    await AuditLog.create({
      action: 'ADMIN_STUDENT_DELETED',
      performedBy: req.user._id,
      targetEntity: 'StudentProfile',
      targetEntityId: profile._id,
      changes: { deletedCollegeId: profile.collegeId },
      ipAddress: req.ip || '',
    });

    return successResponse(res, 200, `Student ${profile.collegeId} deleted successfully.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudentByAdmin,
  deleteStudentByAdmin,
};
