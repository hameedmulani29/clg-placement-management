const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');

jest.mock('../src/config/firebase', () => ({
  verifyFirebaseIdToken: jest.fn(async (idToken) => {
    const identities = {
      'mock-google-new-user': {
        uid: 'google_user_test_9988',
        email: 'priya.patil@college.edu',
        name: 'Priya Patil',
        picture: 'https://lh3.googleusercontent.com/a/sample',
        emailVerified: true,
      },
      'mock-google-existing-user': {
        uid: 'google_user_test_9988',
        email: 'priya.patil@college.edu',
        name: 'Priya Patil',
        emailVerified: true,
      },
      'mock-google-recruiter': {
        uid: 'google_recruiter_test',
        email: 'test.recruiter@company.edu',
        name: 'Test Recruiter',
        emailVerified: true,
      },
      'mock-google-admin': {
        uid: 'google_admin_test',
        email: 'test.admin@college.edu',
        name: 'Test Admin',
        emailVerified: true,
      },
      'mock-google-direct-student': {
        uid: 'google_direct_student_test',
        email: 'direct.student@college.edu',
        name: 'Direct Student',
        emailVerified: true,
      },
    };
    if (identities[idToken]) return identities[idToken];
    const error = new Error('Invalid test token.');
    error.statusCode = 401;
    throw error;
  }),
}));

const app = require('../src/app');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const RecruiterProfile = require('../src/models/RecruiterProfile');
const Company = require('../src/models/Company');
const MongoStudentProfile = require('../src/models/mongoose/StudentProfile');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB(':memory:');
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await RecruiterProfile.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await disconnectDB();
});

describe('Authentication & RBAC Integration Tests (Phase 2)', () => {
  test('Student profile schema allows Google registration without a phone number', async () => {
    const profile = new MongoStudentProfile({
      userId: new mongoose.Types.ObjectId(),
      collegeId: 'STU-123456',
      firstName: 'Google',
      lastName: 'Student',
      department: 'Computer Science',
      graduationYear: 2027,
      cgpa: 8,
    });

    await expect(profile.validate()).resolves.toBeUndefined();
    expect(profile.phone).toBe('');
  });

  const sampleStudent = {
    email: 'test.student@college.edu',
    password: 'Password123!',
    firstName: 'Arjun',
    lastName: 'Sharma',
    collegeId: '2023CS0101',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 8.75,
    activeBacklogs: 0,
    phone: '9876543210',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  };

  let studentAuthToken = '';

  test('POST /api/v1/auth/register-student should register without creating a session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register-student')
      .send(sampleStudent);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeUndefined();
    expect(res.body.data.user.email).toBe(sampleStudent.email.toLowerCase());
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.profile.collegeId).toBe(sampleStudent.collegeId.toUpperCase());
    expect(res.body.data.user.password).toBeUndefined(); // Ensure password is excluded

  });

  test('POST /api/v1/auth/register-student should reject duplicate email', async () => {
    const duplicate = { ...sampleStudent, collegeId: '2023CS0102' };
    const res = await request(app)
      .post('/api/v1/auth/register-student')
      .send(duplicate);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/v1/auth/register-student should reject duplicate collegeId', async () => {
    const duplicateId = { ...sampleStudent, email: 'another.student@college.edu' };
    const res = await request(app)
      .post('/api/v1/auth/register-student')
      .send(duplicateId);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('POST /api/v1/auth/login should authenticate valid student credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: sampleStudent.email,
        password: sampleStudent.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(sampleStudent.email.toLowerCase());
    expect(res.body.data.profile.firstName).toBe('Arjun');
    studentAuthToken = res.body.data.token;
  });

  test('POST /api/v1/auth/login should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: sampleStudent.email,
        password: 'IncorrectPassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('POST /api/v1/auth/register-recruiter should require a separate login', async () => {
    const company = await Company.findOne({});
    const email = 'test.recruiter@company.edu';
    const password = 'RecruiterPassword123!';
    const registration = await request(app)
      .post('/api/v1/auth/register-recruiter')
      .send({
        email,
        password,
        companyId: company._id,
        designation: 'Talent Acquisition Partner',
      });

    expect(registration.statusCode).toBe(201);
    expect(registration.body.data.token).toBeUndefined();
    expect(registration.body.data.user.role).toBe('recruiter');

    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(login.statusCode).toBe(200);
    expect(login.body.data.user.role).toBe('recruiter');

    const googleLogin = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'mock-google-recruiter', portalRole: 'recruiter' });
    expect(googleLogin.statusCode).toBe(200);
    expect(googleLogin.body.data.user.role).toBe('recruiter');

    const passwordLoginAfterGoogle = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });
    expect(passwordLoginAfterGoogle.statusCode).toBe(200);

    const unauthorized = await request(app)
      .get('/api/v1/analytics/admin-summary')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(unauthorized.statusCode).toBe(403);
  });

  test('admin role comes from the stored account and can access admin routes', async () => {
    const email = 'test.admin@college.edu';
    const password = 'AdminPassword123!';
    const adminUser = new User({ email, password, role: 'admin' });
    await adminUser.save();

    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(login.statusCode).toBe(200);
    expect(login.body.data.user.role).toBe('admin');

    const googleLogin = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'mock-google-admin', portalRole: 'tpo' });
    expect(googleLogin.statusCode).toBe(200);
    expect(googleLogin.body.data.user.role).toBe('admin');

    const authorized = await request(app)
      .get('/api/v1/analytics/admin-summary')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(authorized.statusCode).toBe(200);

    const unauthorized = await request(app)
      .get('/api/v1/analytics/admin-summary')
      .set('Authorization', `Bearer ${studentAuthToken}`);
    expect(unauthorized.statusCode).toBe(403);
  });

  test('GET /api/v1/auth/me should return current user profile with valid JWT', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${studentAuthToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(sampleStudent.email.toLowerCase());
    expect(res.body.data.profile.department).toBe('Computer Science');
  });

  test('GET /api/v1/auth/me should reject request without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/access denied/i);
  });

  test('POST /api/v1/auth/google should reject request missing idToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Firebase ID token is required/i);
  });

  test('POST /api/v1/auth/google should not provision a privileged portal role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'mock-google-new-user', portalRole: 'admin', role: 'admin' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/register first|contact your administrator/i);
    expect(await User.findOne({ email: 'priya.patil@college.edu' })).toBeNull();
  });

  test('POST /api/v1/auth/google creates a blank Student account and requires profile completion', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        idToken: 'mock-google-direct-student',
        portalRole: 'student',
        role: 'admin',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.user.displayName).toBe('Direct Student');
    expect(res.body.data.accountCreated).toBe(true);
    expect(res.body.data.profile).toBeNull();
    expect(res.body.data.profileComplete).toBe(false);
    expect(await StudentProfile.findOne({ userId: res.body.data.user._id })).toBeNull();
    expect(await User.findOne({ email: 'direct.student@college.edu' })).not.toBeNull();

    const incompleteProfile = await request(app)
      .put('/api/v1/students/me')
      .set('Authorization', `Bearer ${res.body.data.token}`)
      .send({ firstName: 'Direct' });
    expect(incompleteProfile.statusCode).toBe(400);

    const profileCompletion = await request(app)
      .put('/api/v1/students/me')
      .set('Authorization', `Bearer ${res.body.data.token}`)
      .send({
        collegeId: 'DIRECT-001',
        collegeName: 'COEP Technological University',
        department: 'Computer Science',
        graduationYear: 2027,
        cgpa: 8.25,
        activeBacklogs: 0,
        phone: '+911234567890',
      });
    expect(profileCompletion.statusCode).toBe(201);
    expect(profileCompletion.body.data.collegeId).toBe('DIRECT-001');
    expect(profileCompletion.body.data.firstName).toBe('Direct');
    expect(profileCompletion.body.data.lastName).toBe('Student');
    expect(profileCompletion.body.data.phone).toBe('+911234567890');
  });

  test('POST /api/v1/auth/google/register-student should register without creating a session', async () => {
    const payload = Buffer.from(
      JSON.stringify({
        email: 'priya.patil@college.edu',
        name: 'Priya Patil',
        picture: 'https://lh3.googleusercontent.com/a/sample',
        uid: 'google_user_test_9988',
        exp: Math.floor(Date.now() / 1000) + 3600,
        email_verified: true,
      })
    ).toString('base64');
    const mockToken = `eyJhbGciOiJSUzI1NiJ9.${payload}.signature`;

    const res = await request(app)
      .post('/api/v1/auth/google/register-student')
      .send({
        idToken: 'mock-google-new-user',
        role: 'admin',
        department: 'Information Technology',
        graduationYear: 2026,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeUndefined();
    expect(res.body.data.user.email).toBe('priya.patil@college.edu');
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.profile.firstName).toBe('Priya');
    expect(res.body.data.profile.lastName).toBe('Patil');
    expect(res.body.data.isNewUser).toBe(true);
  });

  test('POST /api/v1/auth/google should log in existing user via Google token', async () => {
    const payload = Buffer.from(
      JSON.stringify({
        email: 'priya.patil@college.edu',
        name: 'Priya Patil',
        uid: 'google_user_test_9988',
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    ).toString('base64');
    const mockToken = `eyJhbGciOiJSUzI1NiJ9.${payload}.signature`;

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        idToken: 'mock-google-existing-user',
        portalRole: 'student',
        role: 'admin',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('priya.patil@college.edu');
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.isNewUser).toBe(false);
  });

  test('POST /api/v1/auth/google should reject an existing account from the wrong portal selection', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        idToken: 'mock-google-existing-user',
        portalRole: 'recruiter',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/registered for the student portal/i);
    expect(res.body.data).toBeUndefined();
  });

  test('GET /api/v1/health should return system status healthy', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('College Placement Management API');
  });
});
