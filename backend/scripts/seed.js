const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Company = require('../src/models/Company');
const RecruiterProfile = require('../src/models/RecruiterProfile');
const PlacementDrive = require('../src/models/PlacementDrive');
const Application = require('../src/models/Application');
const InterviewSchedule = require('../src/models/InterviewSchedule');
const PlacementResult = require('../src/models/PlacementResult');
const Notification = require('../src/models/Notification');
const AuditLog = require('../src/models/AuditLog');

const seedData = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_db';
  console.log(`[Seed Script] Connecting to MongoDB: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI);
    console.log('[Seed Script] Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      Company.deleteMany({}),
      RecruiterProfile.deleteMany({}),
      PlacementDrive.deleteMany({}),
      Application.deleteMany({}),
      InterviewSchedule.deleteMany({}),
      PlacementResult.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed Script] Creating Admin Account (TPO Cell)...');
    const adminUser = await User.create({
      email: 'admin@college.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    console.log('[Seed Script] Creating Corporate Enterprise Partners...');
    const companies = await Company.create([
      {
        name: 'Google Cloud Platform',
        website: 'https://cloud.google.com',
        industry: 'Cloud & Artificial Intelligence',
        description: 'Industry-leading cloud computing, AI, and enterprise data solutions.',
        logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=128&q=80',
        contactEmail: 'campus-hiring@google.com',
        contactPhone: '+1-650-253-0000',
        address: '1600 Amphitheatre Parkway, Mountain View, CA',
        createdBy: adminUser._id,
      },
      {
        name: 'Microsoft Corporation',
        website: 'https://microsoft.com',
        industry: 'Cloud Infrastructure & Enterprise Software',
        description: 'Powering digital transformation with Azure cloud and modern enterprise platforms.',
        logoUrl: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=128&q=80',
        contactEmail: 'university-recruiting@microsoft.com',
        contactPhone: '+1-425-882-8080',
        address: 'One Microsoft Way, Redmond, WA',
        createdBy: adminUser._id,
      },
      {
        name: 'Amazon Web Services',
        website: 'https://aws.amazon.com',
        industry: 'Cloud Infrastructure & Distributed Systems',
        description: 'The world’s most comprehensive and broadly adopted cloud platform.',
        logoUrl: 'https://images.unsplash.com/photo-1523474255658-406167470201?w=128&q=80',
        contactEmail: 'aws-campus@amazon.com',
        contactPhone: '+1-206-266-1000',
        address: '410 Terry Ave N, Seattle, WA',
        createdBy: adminUser._id,
      },
      {
        name: 'Infosys Digital',
        website: 'https://infosys.com',
        industry: 'IT Services & Digital Transformation',
        description: 'Global leader in next-generation digital services and consulting.',
        logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&q=80',
        contactEmail: 'campus@infosys.com',
        contactPhone: '+91-80-2852-0261',
        address: 'Electronics City, Hosur Road, Bangalore, India',
        createdBy: adminUser._id,
      },
    ]);

    console.log('[Seed Script] Creating Recruiter Accounts...');
    const recruiterData = [
      { email: 'recruiter.google@google.com', companyId: companies[0]._id, designation: 'Senior Technical Recruiter' },
      { email: 'recruiter.microsoft@microsoft.com', companyId: companies[1]._id, designation: 'University Talent Partner' },
      { email: 'recruiter.aws@amazon.com', companyId: companies[2]._id, designation: 'Campus Lead - Cloud Architect' },
      { email: 'recruiter.infosys@infosys.com', companyId: companies[3]._id, designation: 'Campus Recruitment Manager' },
    ];

    const recruiters = [];
    for (const r of recruiterData) {
      const u = await User.create({ email: r.email, password: 'RecruiterPassword123!', role: 'recruiter' });
      const profile = await RecruiterProfile.create({
        userId: u._id,
        companyId: r.companyId,
        designation: r.designation,
        phone: '9800000000',
      });
      recruiters.push({ user: u, profile });
    }

    console.log('[Seed Script] Creating Diverse Student Cohort...');
    const studentsRaw = [
      {
        email: 'arjun.sharma@college.edu',
        collegeId: '2023CS0101',
        firstName: 'Arjun',
        lastName: 'Sharma',
        department: 'Computer Science',
        graduationYear: 2026,
        cgpa: 9.35,
        activeBacklogs: 0,
        phone: '9876543210',
        skills: ['React.js', 'Node.js', 'AWS S3', 'Docker', 'MongoDB', 'Python'],
        certifications: [
          { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: 2025 },
          { name: 'Meta Full-Stack Developer', issuer: 'Coursera', year: 2024 },
        ],
        projects: [
          { title: 'Cloud Placement Portal', description: 'MERN stack placement tracker with presigned S3 URLs', link: 'https://github.com/arjun/placecloud' },
          { title: 'Distributed Cache', description: 'In-memory key value cache built with Go and Raft consensus', link: 'https://github.com/arjun/cache' },
        ],
        resumeS3Key: 'resumes/demo/arjun_sharma_resume.pdf',
        resumeOriginalName: 'Arjun_Sharma_Resume.pdf',
      },
      {
        email: 'priya.nair@college.edu',
        collegeId: '2023CS0102',
        firstName: 'Priya',
        lastName: 'Nair',
        department: 'Computer Science',
        graduationYear: 2026,
        cgpa: 8.85,
        activeBacklogs: 0,
        phone: '9876543211',
        skills: ['Java', 'Spring Boot', 'Kubernetes', 'Microservices', 'PostgreSQL'],
        certifications: [{ name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation', year: 2025 }],
        projects: [{ title: 'Fintech Payment Gateway', description: 'Event driven architecture with Kafka', link: 'https://github.com/priya/fintech' }],
        resumeS3Key: 'resumes/demo/priya_nair_resume.pdf',
        resumeOriginalName: 'Priya_Nair_Resume.pdf',
      },
      {
        email: 'rohan.patel@college.edu',
        collegeId: '2023IT0201',
        firstName: 'Rohan',
        lastName: 'Patel',
        department: 'Information Technology',
        graduationYear: 2026,
        cgpa: 7.95,
        activeBacklogs: 0,
        phone: '9876543212',
        skills: ['Python', 'Django', 'React.js', 'SQL', 'FastAPI'],
        certifications: [{ name: 'Google Cloud Associate Cloud Engineer', issuer: 'Google', year: 2025 }],
        projects: [{ title: 'E-commerce Microservices', description: 'Serverless deployment with AWS Lambda', link: 'https://github.com/rohan/shop' }],
        resumeS3Key: 'resumes/demo/rohan_patel_resume.pdf',
        resumeOriginalName: 'Rohan_Patel_Resume.pdf',
      },
      {
        email: 'ananya.deshmukh@college.edu',
        collegeId: '2023EC0301',
        firstName: 'Ananya',
        lastName: 'Deshmukh',
        department: 'Electronics & Communication',
        graduationYear: 2026,
        cgpa: 8.45,
        activeBacklogs: 0,
        phone: '9876543213',
        skills: ['C++', 'Embedded Systems', 'IoT', 'Python', 'AWS IoT Core'],
        certifications: [{ name: 'Embedded Systems Specialist', issuer: 'ARM', year: 2024 }],
        projects: [{ title: 'Smart Energy Grid Monitor', description: 'IoT sensor network streaming telemetry to AWS', link: 'https://github.com/ananya/smartgrid' }],
        resumeS3Key: 'resumes/demo/ananya_deshmukh_resume.pdf',
        resumeOriginalName: 'Ananya_Deshmukh_Resume.pdf',
      },
      {
        email: 'vikram.singh@college.edu',
        collegeId: '2023ME0401',
        firstName: 'Vikram',
        lastName: 'Singh',
        department: 'Mechanical Engineering',
        graduationYear: 2026,
        cgpa: 7.20,
        activeBacklogs: 1,
        phone: '9876543214',
        skills: ['AutoCAD', 'SolidWorks', 'Python for Engineering', 'Data Analysis'],
        certifications: [],
        projects: [{ title: 'Autonomous Drone Chassis', description: 'Lightweight carbon fiber stress analysis', link: 'https://github.com/vikram/drone' }],
        resumeS3Key: 'resumes/demo/vikram_singh_resume.pdf',
        resumeOriginalName: 'Vikram_Singh_Resume.pdf',
      },
      {
        email: 'sneha.kulkarni@college.edu',
        collegeId: '2023EE0501',
        firstName: 'Sneha',
        lastName: 'Kulkarni',
        department: 'Electrical Engineering',
        graduationYear: 2026,
        cgpa: 6.80,
        activeBacklogs: 0,
        phone: '9876543215',
        skills: ['MATLAB', 'Power Systems', 'Circuit Design', 'PLC'],
        certifications: [],
        projects: [{ title: 'Solar Inverter Simulator', description: 'DSP controlled high efficiency power inverter', link: 'https://github.com/sneha/solar' }],
        resumeS3Key: null,
        resumeOriginalName: null,
      },
    ];

    const studentDocs = [];
    for (const s of studentsRaw) {
      const u = await User.create({ email: s.email, password: 'StudentPassword123!', role: 'student' });
      const p = await StudentProfile.create({
        userId: u._id,
        collegeId: s.collegeId,
        firstName: s.firstName,
        lastName: s.lastName,
        department: s.department,
        graduationYear: s.graduationYear,
        cgpa: s.cgpa,
        activeBacklogs: s.activeBacklogs,
        phone: s.phone,
        skills: s.skills,
        certifications: s.certifications,
        projects: s.projects,
        resumeS3Key: s.resumeS3Key,
        resumeOriginalName: s.resumeOriginalName,
        resumeUpdatedAt: s.resumeS3Key ? new Date() : null,
      });
      studentDocs.push({ user: u, profile: p });
    }

    console.log('[Seed Script] Creating Placement Drives with Strict Criteria...');
    const drives = await PlacementDrive.create([
      {
        title: 'Google Cloud Platform - Software Engineer Campus Drive 2026',
        companyId: companies[0]._id,
        jobRole: 'Software Engineer (Cloud Systems)',
        jobDescription: 'Design, test, deploy, and maintain large-scale distributed software applications and cloud services running on global Google Cloud infrastructure.',
        jobLocations: ['Bangalore', 'Hyderabad'],
        salaryPackage: { ctc: 2800000, base: 2200000, currency: 'INR', stipend: 100000 },
        eligibilityCriteria: {
          minCgpa: 8.5,
          allowedDepartments: ['Computer Science', 'Information Technology'],
          graduationYear: 2026,
          maxBacklogs: 0,
        },
        selectionRounds: [
          { roundNumber: 1, roundName: 'Google Online Challenge', description: 'Data structures, graph theory, and algorithmic problem solving' },
          { roundNumber: 2, roundName: 'System Design & Problem Solving', description: 'Distributed computing, API design, and concurrency' },
          { roundNumber: 3, roundName: 'Googleyness & Leadership', description: 'Cultural alignment, ethical leadership, and teamwork' },
        ],
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        createdBy: adminUser._id,
      },
      {
        title: 'Microsoft Azure - Cloud Developer & DevOps Drive 2026',
        companyId: companies[1]._id,
        jobRole: 'Cloud Solutions Engineer',
        jobDescription: 'Build mission-critical hybrid cloud infrastructure, automation pipelines, and enterprise microservices on Microsoft Azure.',
        jobLocations: ['Hyderabad', 'Noida', 'Bangalore'],
        salaryPackage: { ctc: 2200000, base: 1800000, currency: 'INR', stipend: 80000 },
        eligibilityCriteria: {
          minCgpa: 8.0,
          allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
          graduationYear: 2026,
          maxBacklogs: 0,
        },
        selectionRounds: [
          { roundNumber: 1, roundName: 'Online Coding Assessment', description: '3 coding questions on LeetCode Medium/Hard' },
          { roundNumber: 2, roundName: 'Technical Interview 1', description: 'Core CS fundamentals, OS, networking, and algorithms' },
          { roundNumber: 3, roundName: 'Technical Interview 2 & Managerial', description: 'System architecture, cloud tradeoffs, and past projects' },
        ],
        applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: 'ongoing',
        createdBy: adminUser._id,
      },
      {
        title: 'AWS Cloud Solutions Architect - Graduate Program 2026',
        companyId: companies[2]._id,
        jobRole: 'Associate Solutions Architect',
        jobDescription: 'Help strategic global customers build reliable, secure, cost-optimized, and performant cloud architectures on AWS.',
        jobLocations: ['Bangalore', 'Mumbai'],
        salaryPackage: { ctc: 2000000, base: 1650000, currency: 'INR', stipend: 75000 },
        eligibilityCriteria: {
          minCgpa: 7.5,
          allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering'],
          graduationYear: 2026,
          maxBacklogs: 0,
        },
        selectionRounds: [
          { roundNumber: 1, roundName: 'AWS Aptitude & Cloud Fundamentals', description: 'Cloud computing concepts, security, and networking MCQ' },
          { roundNumber: 2, roundName: 'Hands-on Architectural Challenge', description: 'Whiteboarding an AWS architecture scenario' },
          { roundNumber: 3, roundName: 'Amazon Bar Raiser & Leadership Principles', description: 'Amazon 16 leadership principles behavioral assessment' },
        ],
        applicationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'ongoing',
        createdBy: adminUser._id,
      },
      {
        title: 'Infosys Specialist Programmer (Power Programmer) 2026',
        companyId: companies[3]._id,
        jobRole: 'Specialist Programmer',
        jobDescription: 'High-impact engineering role working on complex algorithmic transformations, open source stacks, and rapid prototyping.',
        jobLocations: ['Bangalore', 'Pune', 'Hyderabad', 'Chennai'],
        salaryPackage: { ctc: 950000, base: 850000, currency: 'INR', stipend: 35000 },
        eligibilityCriteria: {
          minCgpa: 6.5,
          allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering'],
          graduationYear: 2026,
          maxBacklogs: 0,
        },
        selectionRounds: [
          { roundNumber: 1, roundName: 'HackWithInfy Coding Round', description: 'Advanced competitive programming problems' },
          { roundNumber: 2, roundName: 'Technical & Behavioral Interview', description: 'Project defense and technical aptitude' },
        ],
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        createdBy: adminUser._id,
      },
    ]);

    console.log('[Seed Script] Submitting Real Multi-Stage Student Applications...');
    // 1. Arjun Sharma applied to Google, Microsoft, and AWS
    const appArjunGoogle = await Application.create({
      placementDriveId: drives[0]._id,
      studentId: studentDocs[0].profile._id,
      status: 'shortlisted',
      currentRound: 2,
      resumeSnapshotKey: studentDocs[0].profile.resumeS3Key,
      notes: 'Ranked in top 5% of online challenge',
    });

    const appArjunMSFT = await Application.create({
      placementDriveId: drives[1]._id,
      studentId: studentDocs[0].profile._id,
      status: 'selected',
      currentRound: 3,
      resumeSnapshotKey: studentDocs[0].profile.resumeS3Key,
      notes: 'Exceptional interview feedback across all 3 rounds',
    });

    const appArjunAWS = await Application.create({
      placementDriveId: drives[2]._id,
      studentId: studentDocs[0].profile._id,
      status: 'applied',
      currentRound: 1,
      resumeSnapshotKey: studentDocs[0].profile.resumeS3Key,
    });

    // 2. Priya Nair applied to Microsoft and Google
    const appPriyaGoogle = await Application.create({
      placementDriveId: drives[0]._id,
      studentId: studentDocs[1].profile._id,
      status: 'selected',
      currentRound: 3,
      resumeSnapshotKey: studentDocs[1].profile.resumeS3Key,
      notes: 'Selected for Cloud Systems Engineering role',
    });

    const appPriyaMSFT = await Application.create({
      placementDriveId: drives[1]._id,
      studentId: studentDocs[1].profile._id,
      status: 'interview_scheduled',
      currentRound: 2,
      resumeSnapshotKey: studentDocs[1].profile.resumeS3Key,
    });

    // 3. Rohan Patel applied to AWS and Infosys
    const appRohanAWS = await Application.create({
      placementDriveId: drives[2]._id,
      studentId: studentDocs[2].profile._id,
      status: 'interview_scheduled',
      currentRound: 2,
      resumeSnapshotKey: studentDocs[2].profile.resumeS3Key,
    });

    const appRohanInfy = await Application.create({
      placementDriveId: drives[3]._id,
      studentId: studentDocs[2].profile._id,
      status: 'shortlisted',
      currentRound: 2,
      resumeSnapshotKey: studentDocs[2].profile.resumeS3Key,
    });

    // 4. Ananya applied to AWS
    const appAnanyaAWS = await Application.create({
      placementDriveId: drives[2]._id,
      studentId: studentDocs[3].profile._id,
      status: 'applied',
      currentRound: 1,
      resumeSnapshotKey: studentDocs[3].profile.resumeS3Key,
    });

    console.log('[Seed Script] Scheduling Real Interviews...');
    await InterviewSchedule.create([
      {
        applicationId: appPriyaMSFT._id,
        placementDriveId: drives[1]._id,
        studentId: studentDocs[1].profile._id,
        roundNumber: 2,
        roundName: 'Azure Core Systems Interview',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        locationOrMeetingLink: 'https://teams.microsoft.com/l/meetup-join/msft-azure-campus-2026',
        instructions: 'Please join 5 minutes early with your camera and IDE ready for live coding.',
        status: 'scheduled',
      },
      {
        applicationId: appRohanAWS._id,
        placementDriveId: drives[2]._id,
        studentId: studentDocs[2].profile._id,
        roundNumber: 2,
        roundName: 'AWS Architectural Scenario Interview',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        locationOrMeetingLink: 'https://chime.aws/78901234',
        instructions: 'Focus on High Availability and Multi-AZ design patterns.',
        status: 'scheduled',
      },
    ]);

    console.log('[Seed Script] Recording Confirmed Final Placement Offers...');
    // 1. Priya Nair placed at Google (28 LPA)
    await PlacementResult.create({
      placementDriveId: drives[0]._id,
      studentId: studentDocs[1].profile._id,
      companyId: companies[0]._id,
      offeredSalary: 2800000,
      offerLetterUrl: 'https://cloud.google.com/offers/2026/priya-nair.pdf',
      selectionDate: new Date(),
      status: 'accepted',
    });

    // 2. Arjun Sharma placed at Microsoft (22 LPA)
    await PlacementResult.create({
      placementDriveId: drives[1]._id,
      studentId: studentDocs[0].profile._id,
      companyId: companies[1]._id,
      offeredSalary: 2200000,
      offerLetterUrl: 'https://microsoft.com/offers/2026/arjun-sharma.pdf',
      selectionDate: new Date(),
      status: 'accepted',
    });

    console.log('[Seed Script] Generating In-App Notifications...');
    await Notification.create([
      {
        recipientId: studentDocs[0].user._id,
        title: '🎉 Offer Letter Received: Microsoft',
        message: 'Congratulations! You have been officially selected by Microsoft Corporation for the role of Cloud Solutions Engineer at 22 LPA.',
        type: 'result',
      },
      {
        recipientId: studentDocs[1].user._id,
        title: '🎉 Offer Letter Received: Google Cloud',
        message: 'Congratulations! Google Cloud Platform has selected you for Software Engineer (Cloud Systems) at 28 LPA.',
        type: 'result',
      },
      {
        recipientId: studentDocs[1].user._id,
        title: '📅 Interview Scheduled: Microsoft Azure',
        message: 'Your Round 2 technical interview with Microsoft is scheduled on Teams.',
        type: 'interview',
      },
      {
        recipientId: studentDocs[2].user._id,
        title: '📅 Interview Call: AWS Solutions Architect',
        message: 'Your AWS Architectural Scenario Interview has been scheduled on Amazon Chime.',
        type: 'interview',
      },
    ]);

    console.log('[Seed Script] Seeding complete! Database successfully populated with realistic demonstration data.');
    console.log('\n================ DEMONSTRATION CREDENTIALS ================');
    console.log('Role: ADMIN (College Placement Officer)');
    console.log('Email: admin@college.edu | Password: AdminPassword123!\n');
    console.log('Role: RECRUITER (Google Cloud)');
    console.log('Email: recruiter.google@google.com | Password: RecruiterPassword123!\n');
    console.log('Role: STUDENT (Arjun Sharma, CS, CGPA: 9.35)');
    console.log('Email: arjun.sharma@college.edu | Password: StudentPassword123!\n');
    console.log('Role: STUDENT (Priya Nair, CS, CGPA: 8.85)');
    console.log('Email: priya.nair@college.edu | Password: StudentPassword123!\n');
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Script Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
