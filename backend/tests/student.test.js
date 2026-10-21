const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Company = require('../src/models/Company');
const RecruiterProfile = require('../src/models/RecruiterProfile');
const AuditLog = require('../src/models/AuditLog');
const { generateToken } = require('../src/utils/jwtHelper');

let adminToken;
let recruiterToken;
let studentTokenA;
let studentTokenB;
let studentProfileA;
let studentProfileB;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB(':memory:');
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await AuditLog.deleteMany({});

  // 1. Create Admin
  const adminUser = await User.create({
    email: 'tpo.admin@college.edu',
    password: 'AdminPassword123!',
    role: 'admin',
  });
  adminToken = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });

  // 2. Create Company & Recruiter
  const company = await Company.create({
    name: 'TechCorp Global',
    industry: 'Software Development',
    contactEmail: 'hr@techcorp.com',
  });

  const recruiterUser = await User.create({
    email: 'recruiter@techcorp.com',
    password: 'RecruiterPassword123!',
    role: 'recruiter',
  });
  await RecruiterProfile.create({
    userId: recruiterUser._id,
    companyId: company._id,
    designation: 'Senior Campus Recruiter',
  });
  recruiterToken = generateToken({ id: recruiterUser._id, email: recruiterUser.email, role: recruiterUser.role });

  // 3. Create Student A (CS)
  const userA = await User.create({
    email: 'student.a@college.edu',
    password: 'StudentPassword123!',
    role: 'student',
  });
  studentProfileA = await StudentProfile.create({
    userId: userA._id,
    collegeId: '2023CS001',
    firstName: 'Priya',
    lastName: 'Nair',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 8.9,
    activeBacklogs: 0,
    phone: '9988776655',
    skills: ['Python', 'Django', 'Docker'],
  });
  studentTokenA = generateToken({ id: userA._id, email: userA.email, role: userA.role });

  // 4. Create Student B (IT)
  const userB = await User.create({
    email: 'student.b@college.edu',
    password: 'StudentPassword123!',
    role: 'student',
  });
  studentProfileB = await StudentProfile.create({
    userId: userB._id,
    collegeId: '2023IT002',
    firstName: 'Rahul',
    lastName: 'Verma',
    department: 'Information Technology',
    graduationYear: 2026,
    cgpa: 7.5,
    activeBacklogs: 1,
    phone: '9988776644',
    skills: ['Java', 'Spring Boot'],
  });
  studentTokenB = generateToken({ id: userB._id, email: userB.email, role: userB.role });
});

afterAll(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await AuditLog.deleteMany({});
  await disconnectDB();
});

describe('Student Module & Profile Management Integration Tests (Phase 3)', () => {
  test('GET /api/v1/students/me should allow student to read their own private profile', async () => {
    const res = await request(app)
      .get('/api/v1/students/me')
      .set('Authorization', `Bearer ${studentTokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.collegeId).toBe('2023CS001');
    expect(res.body.data.firstName).toBe('Priya');
  });

  test('PUT /api/v1/students/me should allow student to update their skills and projects', async () => {
    const res = await request(app)
      .put('/api/v1/students/me')
      .set('Authorization', `Bearer ${studentTokenA}`)
      .send({
        skills: ['Python', 'Django', 'Docker', 'Kubernetes', 'AWS'],
        projects: [{ title: 'Cloud Placement Portal', description: 'MERN stack cloud app', link: 'https://github.com/test' }],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skills).toContain('Kubernetes');
    expect(res.body.data.projects.length).toBe(1);
  });

  test('GET /api/v1/students/:id should prevent Student A from accessing Student B private profile', async () => {
    const res = await request(app)
      .get(`/api/v1/students/${studentProfileB._id}`)
      .set('Authorization', `Bearer ${studentTokenA}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  test('GET /api/v1/students should forbid students from accessing student directory', async () => {
    const res = await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${studentTokenA}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/students should allow Admin to list students with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/students?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta.pagination.totalRecords).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/v1/students should filter by department correctly', async () => {
    const res = await request(app)
      .get('/api/v1/students?department=Computer%20Science')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((s) => s.department === 'Computer Science')).toBe(true);
  });

  test('GET /api/v1/students/:id should allow Recruiter to inspect candidate details', async () => {
    const res = await request(app)
      .get(`/api/v1/students/${studentProfileA._id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe('Priya');
  });

  test('PUT /api/v1/students/:id should allow Admin to update student CGPA and log audit trail', async () => {
    const res = await request(app)
      .put(`/api/v1/students/${studentProfileA._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cgpa: 9.25, activeBacklogs: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cgpa).toBe(9.25);

    // Verify audit log entry
    const audit = await AuditLog.findOne({
      action: 'ADMIN_STUDENT_PROFILE_UPDATED',
      targetEntityId: studentProfileA._id,
    });
    expect(audit).toBeDefined();
    expect(audit.performedBy.toString()).toBeDefined();
  });

  test('DELETE /api/v1/students/:id should allow Admin to delete a student record', async () => {
    const res = await request(app)
      .delete(`/api/v1/students/${studentProfileB._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await StudentProfile.findById(studentProfileB._id);
    expect(deleted).toBeNull();
  });
});
