const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB(':memory:');
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await disconnectDB();
});

describe('Authentication & RBAC Integration Tests (Phase 2)', () => {
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

  test('POST /api/v1/auth/register-student should register student and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register-student')
      .send(sampleStudent);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(sampleStudent.email.toLowerCase());
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.profile.collegeId).toBe(sampleStudent.collegeId.toUpperCase());
    expect(res.body.data.user.password).toBeUndefined(); // Ensure password is excluded

    studentAuthToken = res.body.data.token;
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

  test('GET /api/v1/health should return system status healthy', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('College Placement Management API');
  });
});
