const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const { generateToken } = require('../utils/jwtHelper');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register a new Student Account & Academic Profile
 * POST /api/v1/auth/register-student
 */
const registerStudent = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      collegeId,
      department,
      graduationYear,
      cgpa,
      activeBacklogs = 0,
      phone,
      skills = [],
    } = req.body;

    // Validate essential inputs
    if (!email || !password || !firstName || !lastName || !collegeId || !department || !graduationYear || cgpa === undefined || !phone) {
      return errorResponse(res, 400, 'Please provide all required student registration fields.');
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Check if college ID is already taken
    const existingCollegeId = await StudentProfile.findOne({ collegeId: collegeId.toUpperCase() });
    if (existingCollegeId) {
      return errorResponse(res, 409, `Student with College ID '${collegeId}' is already registered.`);
    }

    // 1. Create User document
    const user = new User({
      email,
      password,
      role: 'student',
    });
    await user.save();

    // 2. Create StudentProfile document
    const profile = new StudentProfile({
      userId: user._id,
      collegeId: collegeId.toUpperCase(),
      firstName,
      lastName,
      department,
      graduationYear: Number(graduationYear),
      cgpa: Number(cgpa),
      activeBacklogs: Number(activeBacklogs),
      phone,
      skills: Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean),
    });
    await profile.save();

    // 3. Issue JWT Token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return successResponse(res, 201, 'Student account registered successfully.', {
      token,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new Recruiter Account
 * POST /api/v1/auth/register-recruiter
 */
const registerRecruiter = async (req, res, next) => {
  try {
    const { email, password, companyId, designation, phone } = req.body;

    if (!email || !password || !companyId || !designation) {
      return errorResponse(res, 400, 'Please provide email, password, company ID, and designation.');
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, 404, 'The selected company does not exist in the database.');
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Create User
    const user = new User({
      email,
      password,
      role: 'recruiter',
    });
    await user.save();

    // Create Recruiter Profile
    const profile = new RecruiterProfile({
      userId: user._id,
      companyId: company._id,
      designation,
      phone: phone || '',
    });
    await profile.save();

    const populatedProfile = await RecruiterProfile.findById(profile._id).populate('companyId', 'name logoUrl industry');

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return successResponse(res, 201, 'Recruiter account registered successfully.', {
      token,
      user,
      profile: populatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unified Login for all roles (Student, Admin, Recruiter)
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide both email and password.');
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    // Check active status
    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact the administrator.');
    }

    // Fetch corresponding profile based on role
    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: user._id }).populate('companyId', 'name logoUrl industry website');
    }

    // Generate JWT Token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return successResponse(res, 200, 'Authentication successful.', {
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: user._id }).populate('companyId', 'name logoUrl industry website');
    }

    return successResponse(res, 200, 'Current user profile retrieved.', {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully.');
};

module.exports = {
  registerStudent,
  registerRecruiter,
  login,
  getMe,
  logout,
};
