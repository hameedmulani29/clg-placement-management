const crypto = require('crypto');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const { generateToken } = require('../utils/jwtHelper');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { verifyFirebaseIdToken } = require('../config/firebase');

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
      collegeName,
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

    const assignedCollege = collegeName ? collegeName.trim() : 'COEP Technological University';

    // 1. Create User document
    const user = new User({
      email,
      password,
      role: 'student',
      collegeName: assignedCollege,
    });
    await user.save();

    // 2. Create StudentProfile document
    const profile = new StudentProfile({
      userId: user._id,
      collegeId: collegeId.toUpperCase(),
      collegeName: assignedCollege,
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
        collegeName: user.collegeName || profile?.collegeName || 'COEP Technological University',
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
        collegeName: user.collegeName || profile?.collegeName || 'COEP Technological University',
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
 * Firebase Google Authentication
 * Unified handler for Google Sign-In and Sign-Up
 * POST /api/v1/auth/google
 */
const googleAuth = async (req, res, next) => {
  try {
    const {
      idToken,
      role = 'student',
      collegeName,
      department,
      graduationYear,
      collegeId,
      phone,
      cgpa,
    } = req.body;

    if (!idToken) {
      return errorResponse(res, 400, 'Firebase ID token is required.');
    }

    // Verify token using Firebase Admin or fallback
    let tokenPayload;
    try {
      tokenPayload = await verifyFirebaseIdToken(idToken);
    } catch (tokenErr) {
      return errorResponse(res, tokenErr.statusCode || 401, tokenErr.message || 'Firebase token verification failed.');
    }
    const { uid, email, name, picture } = tokenPayload;

    if (!email) {
      return errorResponse(res, 400, 'Unable to retrieve verified email from Google account.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Existing User Flow
      if (!user.isActive) {
        return errorResponse(res, 403, 'Your account has been deactivated. Please contact the administrator.');
      }

      // Support role switching if user explicitly clicked Student, Recruiter, or TPO Admin tab
      let needsSave = false;
      const requestedRole = ['student', 'recruiter', 'admin'].includes(role) ? role : null;
      if (requestedRole && user.role !== requestedRole) {
        user.role = requestedRole;
        needsSave = true;
      }

      // Link googleId and avatarUrl if not already set
      if (!user.googleId) {
        user.googleId = uid;
        needsSave = true;
      }
      if (picture && !user.avatarUrl) {
        user.avatarUrl = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }

      // Fetch or provision corresponding profile for active role
      let profile = null;
      if (user.role === 'student') {
        profile = await StudentProfile.findOne({ userId: user._id });
        if (!profile) {
          const nameParts = (name || '').trim().split(' ');
          const firstName = nameParts[0] || 'Student';
          const lastName = nameParts.slice(1).join(' ') || 'User';
          profile = new StudentProfile({
            userId: user._id,
            collegeId: collegeId || `STU-${Math.floor(100000 + Math.random() * 900000)}`,
            collegeName: user.collegeName || collegeName || 'COEP Technological University',
            firstName,
            lastName,
            department: department || 'Computer Science',
            graduationYear: Number(graduationYear) || new Date().getFullYear(),
            cgpa: Number(cgpa) || 8.0,
            activeBacklogs: 0,
            phone: phone || '',
            skills: ['Problem Solving', 'Web Development'],
          });
          await profile.save();
        }
      } else if (user.role === 'recruiter') {
        profile = await RecruiterProfile.findOne({ userId: user._id });
        if (!profile) {
          const defaultCompany = await Company.findOne({});
          profile = new RecruiterProfile({
            userId: user._id,
            companyId: defaultCompany ? defaultCompany._id : null,
            designation: 'Talent Acquisition Partner',
            phone: phone || '',
          });
          await profile.save();
        }
        if (profile && profile.companyId) {
          const company = await Company.findById(profile.companyId);
          if (company) {
            profile = { ...(profile.toObject ? profile.toObject() : profile), companyId: company };
          }
        }
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return successResponse(res, 200, 'Authenticated via Google successfully.', {
        token,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          collegeName: user.collegeName || profile?.collegeName || 'COEP Technological University',
          avatarUrl: user.avatarUrl || picture,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        profile,
        isNewUser: false,
      });
    }

    // 2. New User Registration Flow
    const targetRole = ['student', 'recruiter', 'admin'].includes(role) ? role : 'student';
    const assignedCollege = collegeName ? collegeName.trim() : 'COEP Technological University';
    const randomPassword = crypto.randomBytes(32).toString('hex');

    user = new User({
      email: normalizedEmail,
      password: randomPassword,
      role: targetRole,
      collegeName: assignedCollege,
      googleId: uid,
      avatarUrl: picture || null,
      authProvider: 'google',
      isActive: true,
    });
    await user.save();

    let profile = null;
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Student';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    if (targetRole === 'student') {
      let finalCollegeId = collegeId ? collegeId.toUpperCase().trim() : null;
      if (!finalCollegeId) {
        finalCollegeId = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
        let existingCId = await StudentProfile.findOne({ collegeId: finalCollegeId });
        while (existingCId) {
          finalCollegeId = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
          existingCId = await StudentProfile.findOne({ collegeId: finalCollegeId });
        }
      }

      profile = new StudentProfile({
        userId: user._id,
        collegeId: finalCollegeId,
        collegeName: assignedCollege,
        firstName,
        lastName,
        department: department || 'Computer Science',
        graduationYear: Number(graduationYear) || (new Date().getFullYear() + 1),
        cgpa: Number(cgpa) || 8.0,
        activeBacklogs: 0,
        phone: phone || '',
        skills: ['Problem Solving', 'Data Structures', 'Web Development'],
      });
      await profile.save();
    } else if (targetRole === 'recruiter') {
      const defaultCompany = await Company.findOne({});
      profile = new RecruiterProfile({
        userId: user._id,
        companyId: defaultCompany ? defaultCompany._id : null,
        designation: 'Talent Acquisition Partner',
        phone: phone || '',
      });
      await profile.save();
      if (defaultCompany) {
        profile = await RecruiterProfile.findById(profile._id).populate('companyId', 'name logoUrl industry website');
      }
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return successResponse(res, 201, 'Google account registered and authenticated successfully.', {
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName || profile?.collegeName || assignedCollege,
        avatarUrl: user.avatarUrl || picture,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile,
      isNewUser: true,
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
  googleAuth,
  getMe,
  logout,
};
