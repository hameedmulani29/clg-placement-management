const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Company = require('../src/models/Company');
const RecruiterProfile = require('../src/models/RecruiterProfile');
const PlacementDrive = require('../src/models/PlacementDrive');
const Application = require('../src/models/Application');
const Notification = require('../src/models/Notification');
const { generateToken } = require('../src/utils/jwtHelper');

let adminToken;
let recruiterToken;
let eligibleStudentToken;
let ineligibleStudentToken;
let companyId;
let createdDriveId;
let eligibleStudentProfile;
let ineligibleStudentProfile;
let createdAppId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB(':memory:');
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await PlacementDrive.deleteMany({});
  await Application.deleteMany({});
  await Notification.deleteMany({});

  // 1. Admin
  const adminUser = await User.create({ email: 'tpo.head@college.edu', password: 'Password123!', role: 'admin' });
  adminToken = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });

  // 2. Company & Recruiter
  const company = await Company.create({
    name: 'CloudScale Technologies',
    industry: 'Cloud Computing & DevOps',
    contactEmail: 'talent@cloudscale.io',
  });
  companyId = company._id;

  const recruiterUser = await User.create({ email: 'recruiter@cloudscale.io', password: 'Password123!', role: 'recruiter' });
  await RecruiterProfile.create({ userId: recruiterUser._id, companyId: company._id, designation: 'Talent Lead' });
  recruiterToken = generateToken({ id: recruiterUser._id, email: recruiterUser.email, role: recruiterUser.role });

  // 3. Eligible Student (CS, CGPA 8.5, backlogs 0, year 2026)
  const elUser = await User.create({ email: 'eligible.student@college.edu', password: 'Password123!', role: 'student' });
  eligibleStudentProfile = await StudentProfile.create({
    userId: elUser._id,
    collegeId: '2023CS050',
    firstName: 'Dev',
    lastName: 'Patel',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 8.5,
    activeBacklogs: 0,
    phone: '9988112233',
    skills: ['Node.js', 'AWS', 'Docker'],
  });
  eligibleStudentToken = generateToken({ id: elUser._id, email: elUser.email, role: elUser.role });

  // 4. Ineligible Student (Civil Engineering, CGPA 5.8, backlogs 2, year 2026)
  const inelUser = await User.create({ email: 'ineligible.student@college.edu', password: 'Password123!', role: 'student' });
  ineligibleStudentProfile = await StudentProfile.create({
    userId: inelUser._id,
    collegeId: '2023CV099',
    firstName: 'Rohan',
    lastName: 'Deshmukh',
    department: 'Civil Engineering',
    graduationYear: 2026,
    cgpa: 5.8,
    activeBacklogs: 2,
    phone: '9988223344',
  });
  ineligibleStudentToken = generateToken({ id: inelUser._id, email: inelUser.email, role: inelUser.role });
});

afterAll(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await PlacementDrive.deleteMany({});
  await Application.deleteMany({});
  await Notification.deleteMany({});
  await disconnectDB();
});

describe('Placement Drive, Eligibility & Application Pipeline Tests (Phase 4)', () => {
  test('POST /api/v1/drives should allow Admin to create a placement drive with strict eligibility rules', async () => {
    const drivePayload = {
      title: 'CloudScale Campus Recruitment Drive 2026',
      companyId: companyId.toString(),
      jobRole: 'Associate Cloud Engineer',
      jobDescription: 'Build and deploy scalable microservices on AWS cloud.',
      jobLocations: ['Bangalore', 'Pune'],
      salaryPackage: { ctc: 1400000, base: 1200000 },
      eligibilityCriteria: {
        minCgpa: 7.5,
        allowedDepartments: ['Computer Science', 'Information Technology'],
        graduationYear: 2026,
        maxBacklogs: 0,
      },
      applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };

    const res = await request(app)
      .post('/api/v1/drives')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(drivePayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(drivePayload.title);
    expect(res.body.data.salaryPackage.ctc).toBe(1400000);

    createdDriveId = res.body.data._id;
  });

  test('POST /api/v1/applications should REJECT ineligible student with explicit reasons', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${ineligibleStudentToken}`)
      .send({ placementDriveId: createdDriveId });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/rejected/i);
    expect(Array.isArray(res.body.errors)).toBe(true);
    // Should flag CGPA, department, and backlogs
    expect(res.body.errors.some((r) => r.includes('CGPA'))).toBe(true);
    expect(res.body.errors.some((r) => r.includes('Department'))).toBe(true);
    expect(res.body.errors.some((r) => r.includes('backlog'))).toBe(true);
  });

  test('POST /api/v1/applications should ACCEPT eligible student application', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${eligibleStudentToken}`)
      .send({ placementDriveId: createdDriveId });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('applied');
    expect(res.body.data.currentRound).toBe(1);

    createdAppId = res.body.data._id;
  });

  test('POST /api/v1/applications should PREVENT duplicate application submissions', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${eligibleStudentToken}`)
      .send({ placementDriveId: createdDriveId });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already submitted/i);
  });

  test('GET /api/v1/applications/my-applications should list student application history', async () => {
    const res = await request(app)
      .get('/api/v1/applications/my-applications')
      .set('Authorization', `Bearer ${eligibleStudentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('applied');
  });

  test('GET /api/v1/applications should allow Recruiter to view drive applications', async () => {
    const res = await request(app)
      .get(`/api/v1/applications?driveId=${createdDriveId}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  test('PATCH /api/v1/applications/:id/status should allow Recruiter to shortlist candidate and advance round', async () => {
    const res = await request(app)
      .patch(`/api/v1/applications/${createdAppId}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'shortlisted', currentRound: 2, notes: 'Strong cloud fundamentals' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('shortlisted');
    expect(res.body.data.currentRound).toBe(2);

    // Verify student received in-app notification
    const notification = await Notification.findOne({
      recipientId: eligibleStudentProfile.userId,
      type: 'application',
    }).sort({ createdAt: -1 });
    expect(notification).toBeDefined();
    expect(notification.title).toMatch(/SHORTLISTED/i);
  });

  test('GET /api/v1/drives/:id/eligible-students should evaluate all students into eligible and ineligible cohorts', async () => {
    const res = await request(app)
      .get(`/api/v1/drives/${createdDriveId}/eligible-students`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eligibleCount).toBe(1);
    expect(res.body.data.ineligibleCount).toBe(1);
  });
});
