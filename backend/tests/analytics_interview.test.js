const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Company = require('../src/models/Company');
const RecruiterProfile = require('../src/models/RecruiterProfile');
const PlacementDrive = require('../src/models/PlacementDrive');
const Application = require('../src/models/Application');
const InterviewSchedule = require('../src/models/InterviewSchedule');
const PlacementResult = require('../src/models/PlacementResult');
const Notification = require('../src/models/Notification');
const { generateToken } = require('../src/utils/jwtHelper');

let adminToken;
let recruiterToken;
let studentToken;
let studentUser;
let studentProfile;
let company;
let drive;
let application;
let interviewId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB(':memory:');
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await PlacementDrive.deleteMany({});
  await Application.deleteMany({});
  await InterviewSchedule.deleteMany({});
  await PlacementResult.deleteMany({});
  await Notification.deleteMany({});

  // 1. Admin
  const adminUser = await User.create({ email: 'admin.director@college.edu', password: 'Password123!', role: 'admin' });
  adminToken = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });

  // 2. Company & Recruiter
  company = await Company.create({
    name: 'Amazon Web Services',
    industry: 'Cloud Infrastructure',
    contactEmail: 'aws-campus@amazon.com',
  });

  const recruiterUser = await User.create({ email: 'recruiter@amazon.com', password: 'Password123!', role: 'recruiter' });
  await RecruiterProfile.create({ userId: recruiterUser._id, companyId: company._id, designation: 'University Recruiting Lead' });
  recruiterToken = generateToken({ id: recruiterUser._id, email: recruiterUser.email, role: recruiterUser.role });

  // 3. Student
  studentUser = await User.create({ email: 'kavya.n@college.edu', password: 'Password123!', role: 'student' });
  studentProfile = await StudentProfile.create({
    userId: studentUser._id,
    collegeId: '2023CS088',
    firstName: 'Kavya',
    lastName: 'Nambiar',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 9.1,
    activeBacklogs: 0,
    phone: '9876501234',
    skills: ['Python', 'AWS', 'DynamoDB'],
  });
  studentToken = generateToken({ id: studentUser._id, email: studentUser.email, role: studentUser.role });

  // 4. Drive & Application
  drive = await PlacementDrive.create({
    title: 'AWS Cloud Solutions Architect - Campus Hiring 2026',
    companyId: company._id,
    jobRole: 'Solutions Architect Intern',
    jobDescription: 'Architecting distributed enterprise cloud systems.',
    jobLocations: ['Bangalore'],
    salaryPackage: { ctc: 1800000, base: 1600000 },
    eligibilityCriteria: { minCgpa: 8.0, allowedDepartments: ['Computer Science'], graduationYear: 2026, maxBacklogs: 0 },
    applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdBy: adminUser._id,
  });

  application = await Application.create({
    placementDriveId: drive._id,
    studentId: studentProfile._id,
    status: 'shortlisted',
    currentRound: 1,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Company.deleteMany({});
  await RecruiterProfile.deleteMany({});
  await PlacementDrive.deleteMany({});
  await Application.deleteMany({});
  await InterviewSchedule.deleteMany({});
  await PlacementResult.deleteMany({});
  await Notification.deleteMany({});
  await disconnectDB();
});

describe('Interview Scheduling, Results, Analytics & Reports Integration Tests (Phases 5 & 6)', () => {
  test('POST /api/v1/interviews should schedule an interview and update application status', async () => {
    const interviewPayload = {
      applicationId: application._id.toString(),
      roundNumber: 1,
      roundName: 'Technical Architecture Round',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      locationOrMeetingLink: 'https://chime.aws/12345678',
      instructions: 'Please be prepared to present your cloud project architecture.',
    };

    const res = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send(interviewPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.roundName).toBe(interviewPayload.roundName);

    interviewId = res.body.data._id;

    // Verify application status changed to interview_scheduled
    const updatedApp = await Application.findById(application._id);
    expect(updatedApp.status).toBe('interview_scheduled');
  });

  test('GET /api/v1/interviews/my-schedule should allow student to inspect their interview calls', async () => {
    const res = await request(app)
      .get('/api/v1/interviews/my-schedule')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].locationOrMeetingLink).toContain('chime.aws');
  });

  test('PATCH /api/v1/interviews/:id should update interview feedback', async () => {
    const res = await request(app)
      .patch(`/api/v1/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'completed', interviewerFeedback: 'Exceptional system design fundamentals.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.interviewerFeedback).toContain('Exceptional');
  });

  test('POST /api/v1/results should publish final offer and mark application selected', async () => {
    const resultPayload = {
      placementDriveId: drive._id.toString(),
      studentId: studentProfile._id.toString(),
      companyId: company._id.toString(),
      offeredSalary: 1800000,
      offerLetterUrl: 'https://aws.amazon.com/offers/2026/kavya',
    };

    const res = await request(app)
      .post('/api/v1/results')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send(resultPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.offeredSalary).toBe(1800000);

    // Verify application status is selected
    const updatedApp = await Application.findById(application._id);
    expect(updatedApp.status).toBe('selected');
  });

  test('GET /api/v1/notifications should return student notifications including offer notice', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/analytics/admin-summary should return aggregate statistics with true placement %', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/admin-summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalStudents).toBe(1);
    expect(res.body.data.totalSelectedStudents).toBe(1);
    expect(res.body.data.placementRate).toBe(100);
    expect(res.body.data.salaryStatistics.highestSalary).toBe(1800000);
  });

  test('GET /api/v1/analytics/department-wise should calculate departmental placement stats', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/department-wise')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const csDept = res.body.data.find((d) => d.department === 'Computer Science');
    expect(csDept).toBeDefined();
    expect(csDept.placedStudents).toBe(1);
  });

  test('GET /api/v1/reports/export-csv should stream a valid CSV file with placement records', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export-csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('College ID');
    expect(res.text).toContain('2023CS088');
    expect(res.text).toContain('Amazon Web Services');
  });
});
