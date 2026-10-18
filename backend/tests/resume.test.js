const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Company = require('../src/models/Company');
const RecruiterProfile = require('../src/models/RecruiterProfile');
const PlacementDrive = require('../src/models/PlacementDrive');
const Application = require('../src/models/Application');
const { generateToken } = require('../src/utils/jwtHelper');

const TEST_MONGO_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/placement_test_db';

let adminToken;
let recruiterToken;
let studentTokenA;
let studentTokenB;
let studentProfileA;
let studentProfileB;
let company;
let drive;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await mongoose.connect(TEST_MONGO_URI);
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await PlacementDrive.deleteMany({});
  await Application.deleteMany({});

  // 1. Admin
  const adminUser = await User.create({ email: 'tpo.dean@college.edu', password: 'Password123!', role: 'admin' });
  adminToken = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });

  // 2. Company & Recruiter
  company = await Company.create({
    name: 'Microsoft Corporation',
    industry: 'Enterprise Software & Cloud',
    contactEmail: 'campus@microsoft.com',
  });

  const recruiterUser = await User.create({ email: 'recruiter@microsoft.com', password: 'Password123!', role: 'recruiter' });
  await RecruiterProfile.create({ userId: recruiterUser._id, companyId: company._id, designation: 'Principal Recruiter' });
  recruiterToken = generateToken({ id: recruiterUser._id, email: recruiterUser.email, role: recruiterUser.role });

  // 3. Placement Drive
  drive = await PlacementDrive.create({
    title: 'Microsoft Azure SWE Campus Drive 2026',
    companyId: company._id,
    jobRole: 'Software Engineer - Azure',
    jobDescription: 'Distributed systems engineering at cloud scale.',
    salaryPackage: { ctc: 2400000, base: 2000000 },
    eligibilityCriteria: { minCgpa: 8.0, allowedDepartments: ['Computer Science'], graduationYear: 2026, maxBacklogs: 0 },
    applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdBy: adminUser._id,
  });

  // 4. Student A (Applies to Microsoft drive)
  const userA = await User.create({ email: 'student.a@college.edu', password: 'Password123!', role: 'student' });
  studentProfileA = await StudentProfile.create({
    userId: userA._id,
    collegeId: '2023CS010',
    firstName: 'Aarav',
    lastName: 'Singhania',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 9.4,
    activeBacklogs: 0,
    phone: '9811223344',
  });
  studentTokenA = generateToken({ id: userA._id, email: userA.email, role: userA.role });

  // Create application for Student A
  await Application.create({
    placementDriveId: drive._id,
    studentId: studentProfileA._id,
    status: 'applied',
  });

  // 5. Student B (Does NOT apply to Microsoft drive)
  const userB = await User.create({ email: 'student.b@college.edu', password: 'Password123!', role: 'student' });
  studentProfileB = await StudentProfile.create({
    userId: userB._id,
    collegeId: '2023CS020',
    firstName: 'Meera',
    lastName: 'Iyer',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 8.8,
    activeBacklogs: 0,
    phone: '9811223355',
  });
  studentTokenB = generateToken({ id: userB._id, email: userB.email, role: userB.role });
});

afterAll(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await PlacementDrive.deleteMany({});
  await Application.deleteMany({});
  await mongoose.connection.close();
});

describe('Resume Upload & S3 Presigned URL Security Tests (Phase 7)', () => {
  test('POST /api/v1/resumes/upload should allow student to upload valid PDF resume', async () => {
    const dummyPdfBuffer = Buffer.from('%PDF-1.4 sample resume content for testing purposes');

    const res = await request(app)
      .post('/api/v1/resumes/upload')
      .set('Authorization', `Bearer ${studentTokenA}`)
      .attach('resume', dummyPdfBuffer, 'Aarav_Singhania_Resume.pdf');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resumeS3Key).toBeDefined();
    expect(res.body.data.resumeOriginalName).toBe('Aarav_Singhania_Resume.pdf');

    // Verify StudentProfile was updated in database
    const updated = await StudentProfile.findById(studentProfileA._id);
    expect(updated.resumeS3Key).toBe(res.body.data.resumeS3Key);
  });

  test('POST /api/v1/resumes/upload should reject invalid file types (.txt or executable)', async () => {
    const textBuffer = Buffer.from('plain text file');

    const res = await request(app)
      .post('/api/v1/resumes/upload')
      .set('Authorization', `Bearer ${studentTokenA}`)
      .attach('resume', textBuffer, 'notes.txt');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid file format/i);
  });

  test('GET /api/v1/resumes/view/:studentId should allow Student A to view their own resume', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/view/${studentProfileA._id}`)
      .set('Authorization', `Bearer ${studentTokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.downloadUrl).toBeDefined();
    expect(res.body.data.expiresInSeconds).toBe(900);
  });

  test('GET /api/v1/resumes/view/:studentId should FORBID Student B from viewing Student A resume', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/view/${studentProfileA._id}`)
      .set('Authorization', `Bearer ${studentTokenB}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  test('GET /api/v1/resumes/view/:studentId should allow Recruiter to view resume of student who applied to their drive', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/view/${studentProfileA._id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.downloadUrl).toBeDefined();
  });

  test('GET /api/v1/resumes/view/:studentId should FORBID Recruiter from viewing resume of unapplied student', async () => {
    // First give Student B a dummy resume
    await StudentProfile.findByIdAndUpdate(studentProfileB._id, {
      resumeS3Key: 'resumes/dummy/resume.pdf',
      resumeOriginalName: 'Meera_Resume.pdf',
    });

    const res = await request(app)
      .get(`/api/v1/resumes/view/${studentProfileB._id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  test('GET /api/v1/resumes/view/:studentId should allow Admin to view any student resume', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/view/${studentProfileA._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.downloadUrl).toBeDefined();
  });
});
