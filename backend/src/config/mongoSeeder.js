const MongoUser = require('../models/mongoose/User');
const MongoStudentProfile = require('../models/mongoose/StudentProfile');
const MongoCompany = require('../models/mongoose/Company');
const MongoRecruiterProfile = require('../models/mongoose/RecruiterProfile');
const MongoPlacementDrive = require('../models/mongoose/PlacementDrive');
const MongoApplication = require('../models/mongoose/Application');
const MongoInterviewSchedule = require('../models/mongoose/InterviewSchedule');
const MongoPlacementResult = require('../models/mongoose/PlacementResult');
const MongoNotification = require('../models/mongoose/Notification');
const MongoAuditLog = require('../models/mongoose/AuditLog');

/**
 * Seed or Auto-Initialize MongoDB Atlas
 * @param {Object} options
 * @param {boolean} options.reset - If true, wipes existing collections before seeding
 */
const seedMongoData = async ({ reset = false } = {}) => {
  // If not resetting, check if database already has users
  if (!reset) {
    const existingUsersCount = await MongoUser.countDocuments();
    if (existingUsersCount > 0) {
      console.log(`[Database] 🍃 MongoDB Atlas already initialized (${existingUsersCount} existing users found).`);
      return { initialized: false, existingUsers: existingUsersCount };
    }
    console.log('[Database] 🍃 MongoDB Atlas is empty. Auto-initializing collections & default accounts...');
  }

  // 1. Build Collection Indexes
  await Promise.all([
    MongoUser.createIndexes().catch(() => {}),
    MongoStudentProfile.createIndexes().catch(() => {}),
    MongoCompany.createIndexes().catch(() => {}),
    MongoRecruiterProfile.createIndexes().catch(() => {}),
    MongoPlacementDrive.createIndexes().catch(() => {}),
    MongoApplication.createIndexes().catch(() => {}),
    MongoInterviewSchedule.createIndexes().catch(() => {}),
    MongoPlacementResult.createIndexes().catch(() => {}),
    MongoNotification.createIndexes().catch(() => {}),
    MongoAuditLog.createIndexes().catch(() => {}),
  ]);

  // 2. Clear collections if explicit reset
  if (reset) {
    await Promise.all([
      MongoUser.deleteMany({}),
      MongoStudentProfile.deleteMany({}),
      MongoCompany.deleteMany({}),
      MongoRecruiterProfile.deleteMany({}),
      MongoPlacementDrive.deleteMany({}),
      MongoApplication.deleteMany({}),
      MongoInterviewSchedule.deleteMany({}),
      MongoPlacementResult.deleteMany({}),
      MongoNotification.deleteMany({}),
      MongoAuditLog.deleteMany({}),
    ]);
  }

  // 3. Create Admin User
  const adminUser = new MongoUser({
    email: 'admin@college.edu',
    password: 'AdminPassword123!',
    role: 'admin',
  });
  await adminUser.save();

  // 4. Create Companies
  const companies = await MongoCompany.create([
    {
      name: 'Google Cloud Platform',
      website: 'https://cloud.google.com',
      industry: 'Cloud & Artificial Intelligence',
      description: 'Global leader in enterprise cloud computing, AI platforms, and hyper-scale infrastructure.',
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
      description: 'Empowering digital transformation across enterprise systems with Azure, Windows, and AI.',
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
      description: 'The worlds most comprehensive and broadly adopted cloud platform.',
      logoUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=128&q=80',
      contactEmail: 'aws-campus@amazon.com',
      contactPhone: '+1-206-266-1000',
      address: '410 Terry Ave N, Seattle, WA',
      createdBy: adminUser._id,
    },
    {
      name: 'Cisco Systems',
      website: 'https://cisco.com',
      industry: 'Computer Networking & Cybersecurity',
      description: 'Transforming enterprise telecommunications, software-defined networking, and security.',
      logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&q=80',
      contactEmail: 'campus@cisco.com',
      contactPhone: '+1-408-526-4000',
      address: '170 West Tasman Dr, San Jose, CA',
      createdBy: adminUser._id,
    },
    {
      name: 'Oracle Corporation',
      website: 'https://oracle.com',
      industry: 'Database & Autonomous Cloud',
      description: 'Autonomous database technology and enterprise cloud applications.',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&q=80',
      contactEmail: 'campus-recruiting@oracle.com',
      contactPhone: '+1-800-633-0738',
      address: '2300 Oracle Way, Austin, TX',
      createdBy: adminUser._id,
    },
  ]);

  // 5. Create Recruiters
  const recruiterGoogleUser = new MongoUser({
    email: 'recruiter.google@google.com',
    password: 'RecruiterPassword123!',
    role: 'recruiter',
  });
  await recruiterGoogleUser.save();

  await MongoRecruiterProfile.create({
    userId: recruiterGoogleUser._id,
    companyId: companies[0]._id,
    designation: 'Staff University Talent Partner',
    phone: '+1-650-555-0199',
    isVerified: true,
  });

  const recruiterMsftUser = new MongoUser({
    email: 'recruiter.msft@microsoft.com',
    password: 'RecruiterPassword123!',
    role: 'recruiter',
  });
  await recruiterMsftUser.save();

  await MongoRecruiterProfile.create({
    userId: recruiterMsftUser._id,
    companyId: companies[1]._id,
    designation: 'Campus Hiring Lead - Engineering',
    phone: '+1-425-555-0144',
    isVerified: true,
  });

  // 6. Create Students
  const studentData = [
    {
      email: 'arjun.sharma@college.edu',
      password: 'StudentPassword123!',
      firstName: 'Arjun',
      lastName: 'Sharma',
      collegeId: '2022BCS001',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 9.35,
      activeBacklogs: 0,
      phone: '+91 98765 43210',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'System Design', 'Docker'],
    },
    {
      email: 'aarav.singhania@college.edu',
      password: 'StudentPassword123!',
      firstName: 'Aarav',
      lastName: 'Singhania',
      collegeId: '2022BCS045',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 9.18,
      activeBacklogs: 0,
      phone: '+91 98765 43211',
      skills: ['C++', 'Algorithms', 'Distributed Systems', 'Golang', 'Kubernetes'],
    },
    {
      email: 'priya.venkatesh@college.edu',
      password: 'StudentPassword123!',
      firstName: 'Priya',
      lastName: 'Venkatesh',
      collegeId: '2022BIT012',
      department: 'Information Technology',
      graduationYear: 2026,
      cgpa: 8.85,
      activeBacklogs: 0,
      phone: '+91 98765 43212',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'PostgreSQL', 'FastAPI'],
    },
    {
      email: 'rohan.mehta@college.edu',
      password: 'StudentPassword123!',
      firstName: 'Rohan',
      lastName: 'Mehta',
      collegeId: '2022BEC088',
      department: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 7.92,
      activeBacklogs: 0,
      phone: '+91 98765 43213',
      skills: ['Embedded Systems', 'IoT', 'C', 'VLSI', 'Python'],
    },
    {
      email: 'ananya.iyer@college.edu',
      password: 'StudentPassword123!',
      firstName: 'Ananya',
      lastName: 'Iyer',
      collegeId: '2022BCS092',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.65,
      activeBacklogs: 0,
      phone: '+91 98765 43214',
      skills: ['Full Stack', 'Next.js', 'TypeScript', 'GraphQL', 'MongoDB'],
    },
  ];

  const studentProfiles = [];
  for (const s of studentData) {
    const u = new MongoUser({
      email: s.email,
      password: s.password,
      role: 'student',
    });
    await u.save();

    const p = await MongoStudentProfile.create({
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
      projects: [
        {
          title: 'High-Concurrency Event Platform',
          description: 'Microservices architecture handling 10,000 req/sec with Redis and Kafka.',
          link: 'https://github.com/example/event-platform',
          techStack: ['Node.js', 'Kafka', 'Redis', 'Docker'],
        },
      ],
    });
    studentProfiles.push(p);
  }

  // 7. Create Placement Drives
  const drives = await MongoPlacementDrive.create([
    {
      title: 'Google Cloud — Associate Cloud Architect (2026 Batch)',
      companyId: companies[0]._id,
      jobRole: 'Associate Cloud Architect',
      jobDescription: 'Architect resilient enterprise solutions using Google Cloud Platform infrastructure, Kubernetes engines, and automated CI/CD pipelines.',
      jobLocations: ['Bangalore', 'Hyderabad'],
      salaryPackage: {
        ctc: 3250000,
        baseSalary: 2400000,
        breakdown: '24 LPA Base + 5 LPA Joining Bonus + 3.5 LPA RSUs',
      },
      eligibilityCriteria: {
        minCgpa: 8.0,
        maxBacklogs: 0,
        allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
        graduationYear: 2026,
      },
      selectionRounds: [
        { roundNumber: 1, roundName: 'Online Coding Challenge', description: 'Algorithms and Data Structures on HackerRank' },
        { roundNumber: 2, roundName: 'System Architecture & Problem Solving', description: 'Cloud fundamentals and scalable architecture' },
        { roundNumber: 3, roundName: 'Googleyness & Leadership', description: 'Collaboration and team fitment interview' },
      ],
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      createdBy: adminUser._id,
    },
    {
      title: 'Microsoft — Software Development Engineer 1',
      companyId: companies[1]._id,
      jobRole: 'Software Development Engineer 1',
      jobDescription: 'Develop hyperscale cloud services for Azure, Office 365, and AI platforms. High ownership on production code.',
      jobLocations: ['Bangalore', 'Hyderabad', 'Noida'],
      salaryPackage: {
        ctc: 4450000,
        baseSalary: 2800000,
        breakdown: '28 LPA Base + 6 LPA Sign-on + 10.5 LPA Stock Grants',
      },
      eligibilityCriteria: {
        minCgpa: 8.5,
        maxBacklogs: 0,
        allowedDepartments: ['Computer Science', 'Information Technology'],
        graduationYear: 2026,
      },
      selectionRounds: [
        { roundNumber: 1, roundName: 'Online Assessment', description: '3 algorithmic problems on Codility' },
        { roundNumber: 2, roundName: 'Technical Round 1', description: 'Data structures, algorithms, and complexity analysis' },
        { roundNumber: 3, roundName: 'Technical Round 2', description: 'System design, operating systems, and concurrency' },
        { roundNumber: 4, roundName: 'AA (As-Appropriate) Director Round', description: 'Leadership principles and cultural alignment' },
      ],
      applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      createdBy: adminUser._id,
    },
    {
      title: 'Amazon Web Services — Cloud Support Associate',
      companyId: companies[2]._id,
      jobRole: 'Cloud Support Associate',
      jobDescription: 'Deploy, debug, and optimize distributed cloud architectures on AWS EC2, S3, RDS, and ECS.',
      jobLocations: ['Bangalore'],
      salaryPackage: {
        ctc: 2400000,
        baseSalary: 1800000,
        breakdown: '18 LPA Base + 4 LPA Sign-on + 2 LPA Performance',
      },
      eligibilityCriteria: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering'],
        graduationYear: 2026,
      },
      selectionRounds: [
        { roundNumber: 1, roundName: 'Aptitude & Linux Troubleshooting', description: 'Networking and OS test' },
        { roundNumber: 2, roundName: 'Technical Interview', description: 'Cloud and networking deep dive' },
      ],
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      createdBy: adminUser._id,
    },
  ]);

  // 8. Create Applications
  const app1 = await MongoApplication.create({
    placementDriveId: drives[0]._id,
    studentId: studentProfiles[0]._id,
    status: 'shortlisted',
    currentRound: 2,
    appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Strong candidate. Scored 98% in online assessment.',
  });

  const app2 = await MongoApplication.create({
    placementDriveId: drives[1]._id,
    studentId: studentProfiles[0]._id,
    status: 'interview_scheduled',
    currentRound: 2,
    appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Cleared Round 1 with distinction.',
  });

  await MongoApplication.create({
    placementDriveId: drives[0]._id,
    studentId: studentProfiles[1]._id,
    status: 'interview_scheduled',
    currentRound: 2,
    appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  // 9. Create Interview Schedule
  await MongoInterviewSchedule.create({
    applicationId: app2._id,
    placementDriveId: drives[1]._id,
    studentId: studentProfiles[0]._id,
    roundName: 'Technical Round 2: System Architecture',
    roundNumber: 2,
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    mode: 'virtual',
    locationOrMeetingLink: 'https://teams.microsoft.com/l/meetup-join/placecloud-demo',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/placecloud-demo',
    instructions: 'Please be ready with an IDE and whiteboard tool for distributed system design.',
    status: 'scheduled',
    scheduledBy: recruiterMsftUser._id,
  });

  // 10. Create Placement Result
  await MongoPlacementResult.create({
    placementDriveId: drives[2]._id,
    studentId: studentProfiles[2]._id,
    companyId: companies[2]._id,
    status: 'accepted',
    packageOffered: 2400000,
    offeredSalary: 2400000,
    designation: 'Cloud Support Associate',
    offerLetterUrl: 'https://aws.amazon.com/careers/offers/2026/sample-letter.pdf',
    selectionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    remarks: 'Top performing candidate in practical diagnostics.',
  });

  // 11. Create Notifications
  await MongoNotification.create([
    {
      recipientId: studentProfiles[0].userId,
      title: 'Interview Scheduled: Microsoft SDE 1',
      message: 'Your Technical Round 2 has been scheduled for Oct 24 on Microsoft Teams. Check your interview schedule for details.',
      type: 'interview',
      isRead: false,
    },
    {
      recipientId: studentProfiles[0].userId,
      title: 'Application Shortlisted: Google Cloud',
      message: 'Congratulations! You have been shortlisted for Round 2: System Architecture for Google Cloud Platform.',
      type: 'application',
      isRead: false,
    },
    {
      recipientId: adminUser._id,
      title: 'New Drive Published: Google Cloud Platform',
      message: 'Associate Cloud Architect drive has been published for eligible 2026 batch candidates.',
      type: 'drive',
      isRead: false,
    },
  ]);

  // 12. Create Audit Log
  await MongoAuditLog.create({
    performedBy: adminUser._id,
    action: reset ? 'DATABASE_RESET_AND_SEEDED' : 'AUTO_DATABASE_INITIALIZATION',
    entityType: 'System',
    targetEntity: 'System',
    changes: { status: 'Database initialized successfully with enterprise seeding.' },
    ipAddress: '127.0.0.1',
  });

  console.log('[Database] 🚀 MongoDB Atlas initialization complete:');
  console.log('           • Admin:     admin@college.edu / AdminPassword123!');
  console.log('           • Recruiter: recruiter.google@google.com / RecruiterPassword123!');
  console.log('           • Student:   arjun.sharma@college.edu / StudentPassword123!');

  return {
    initialized: true,
    usersCount: await MongoUser.countDocuments(),
  };
};

module.exports = {
  seedMongoData,
};
