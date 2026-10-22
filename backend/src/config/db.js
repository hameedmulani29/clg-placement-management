const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Ensure backend .env is loaded
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');

let db = null;
let dbPath = null;
let dbType = 'sqlite'; // 'mongodb' | 'sqlite'

const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS users (
  _id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'admin', 'recruiter')),
  collegeName TEXT DEFAULT 'COEP Technological University',
  googleId TEXT DEFAULT NULL,
  avatarUrl TEXT DEFAULT NULL,
  authProvider TEXT DEFAULT 'local',
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_profiles (
  _id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
  collegeId TEXT UNIQUE NOT NULL,
  collegeName TEXT NOT NULL DEFAULT 'COEP Technological University',
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  department TEXT NOT NULL,
  graduationYear INTEGER NOT NULL,
  cgpa REAL NOT NULL,
  activeBacklogs INTEGER NOT NULL DEFAULT 0,
  phone TEXT NOT NULL,
  skills TEXT NOT NULL DEFAULT '[]',
  certifications TEXT NOT NULL DEFAULT '[]',
  projects TEXT NOT NULL DEFAULT '[]',
  resumeS3Key TEXT DEFAULT NULL,
  resumeOriginalName TEXT DEFAULT NULL,
  resumeUpdatedAt TEXT DEFAULT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
  _id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  website TEXT DEFAULT '',
  industry TEXT NOT NULL,
  description TEXT DEFAULT '',
  logoUrl TEXT DEFAULT '',
  contactEmail TEXT NOT NULL,
  contactPhone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  isActive INTEGER NOT NULL DEFAULT 1,
  createdBy TEXT DEFAULT NULL REFERENCES users(_id) ON DELETE SET NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recruiter_profiles (
  _id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
  companyId TEXT NOT NULL REFERENCES companies(_id) ON DELETE CASCADE,
  designation TEXT NOT NULL,
  phone TEXT DEFAULT '',
  isVerified INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS placement_drives (
  _id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  companyId TEXT NOT NULL REFERENCES companies(_id) ON DELETE CASCADE,
  jobRole TEXT NOT NULL,
  jobDescription TEXT NOT NULL,
  jobLocations TEXT NOT NULL DEFAULT '["Bangalore"]',
  salaryPackage TEXT NOT NULL,
  eligibilityCriteria TEXT NOT NULL,
  collegeSpecificCriteria TEXT NOT NULL DEFAULT '[]',
  selectionRounds TEXT NOT NULL DEFAULT '[]',
  applicationDeadline TEXT NOT NULL,
  driveDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  createdBy TEXT NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  _id TEXT PRIMARY KEY,
  placementDriveId TEXT NOT NULL REFERENCES placement_drives(_id) ON DELETE CASCADE,
  studentId TEXT NOT NULL REFERENCES student_profiles(_id) ON DELETE CASCADE,
  appliedDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK(status IN ('applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected')),
  currentRound INTEGER NOT NULL DEFAULT 1,
  notes TEXT DEFAULT '',
  resumeSnapshotKey TEXT DEFAULT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(placementDriveId, studentId)
);

CREATE TABLE IF NOT EXISTS interview_schedules (
  _id TEXT PRIMARY KEY,
  applicationId TEXT NOT NULL REFERENCES applications(_id) ON DELETE CASCADE,
  placementDriveId TEXT NOT NULL REFERENCES placement_drives(_id) ON DELETE CASCADE,
  studentId TEXT NOT NULL REFERENCES student_profiles(_id) ON DELETE CASCADE,
  scheduledDate TEXT NOT NULL,
  roundName TEXT NOT NULL,
  roundNumber INTEGER NOT NULL DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'virtual' CHECK(mode IN ('in-person', 'virtual')),
  meetingLink TEXT DEFAULT '',
  location TEXT DEFAULT '',
  locationOrMeetingLink TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  interviewerFeedback TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  scheduledBy TEXT DEFAULT NULL REFERENCES users(_id) ON DELETE SET NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS placement_results (
  _id TEXT PRIMARY KEY,
  placementDriveId TEXT NOT NULL REFERENCES placement_drives(_id) ON DELETE CASCADE,
  studentId TEXT NOT NULL REFERENCES student_profiles(_id) ON DELETE CASCADE,
  companyId TEXT NOT NULL REFERENCES companies(_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offered' CHECK(status IN ('offered', 'accepted', 'rejected')),
  packageOffered REAL NOT NULL DEFAULT 0,
  offeredSalary REAL DEFAULT 0,
  designation TEXT NOT NULL DEFAULT 'Software Engineer',
  offerLetterUrl TEXT DEFAULT '',
  selectionDate TEXT NOT NULL,
  joinedDate TEXT DEFAULT NULL,
  remarks TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  _id TEXT PRIMARY KEY,
  recipientId TEXT NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK(type IN ('drive', 'application', 'interview', 'result', 'system')),
  isRead INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  _id TEXT PRIMARY KEY,
  performedBy TEXT DEFAULT NULL REFERENCES users(_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entityType TEXT DEFAULT '',
  entityId TEXT DEFAULT NULL,
  targetEntity TEXT DEFAULT '',
  targetEntityId TEXT DEFAULT NULL,
  changes TEXT NOT NULL DEFAULT '{}',
  ipAddress TEXT DEFAULT '',
  userAgent TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_userId ON student_profiles(userId);
CREATE INDEX IF NOT EXISTS idx_students_collegeId ON student_profiles(collegeId);
CREATE INDEX IF NOT EXISTS idx_students_dept ON student_profiles(department);
CREATE INDEX IF NOT EXISTS idx_students_cgpa ON student_profiles(cgpa);
CREATE INDEX IF NOT EXISTS idx_recruiters_userId ON recruiter_profiles(userId);
CREATE INDEX IF NOT EXISTS idx_recruiters_companyId ON recruiter_profiles(companyId);
CREATE INDEX IF NOT EXISTS idx_drives_companyId ON placement_drives(companyId);
CREATE INDEX IF NOT EXISTS idx_drives_status ON placement_drives(status);
CREATE INDEX IF NOT EXISTS idx_drives_deadline ON placement_drives(applicationDeadline);
CREATE INDEX IF NOT EXISTS idx_apps_drive ON applications(placementDriveId);
CREATE INDEX IF NOT EXISTS idx_apps_student ON applications(studentId);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_interviews_app ON interview_schedules(applicationId);
CREATE INDEX IF NOT EXISTS idx_interviews_student ON interview_schedules(studentId);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interview_schedules(scheduledDate);
CREATE INDEX IF NOT EXISTS idx_results_drive ON placement_results(placementDriveId);
CREATE INDEX IF NOT EXISTS idx_results_student ON placement_results(studentId);
CREATE INDEX IF NOT EXISTS idx_results_company ON placement_results(companyId);
CREATE INDEX IF NOT EXISTS idx_notifs_recipient ON notifications(recipientId);
CREATE INDEX IF NOT EXISTS idx_notifs_read ON notifications(recipientId, isRead);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_performedBy ON audit_logs(performedBy);
`;

/**
 * Connect to database.
 * If MONGODB_URI is provided, connects to MongoDB Atlas / Local MongoDB.
 * Otherwise, falls back to SQLite (file or in-memory for testing).
 */
const connectDB = async (customPath) => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  // 1. Check for MongoDB Configuration
  if (mongoUri && process.env.NODE_ENV !== 'test') {
    try {
      console.log('[Database] Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        dbName: 'placecloud',
      });
      dbType = 'mongodb';
      console.log(`[Database] MongoDB Atlas connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);

      // Auto-seed initial enterprise data if MongoDB Atlas is fresh/empty
      try {
        const { seedMongoData } = require('./mongoSeeder');
        await seedMongoData({ reset: false });
      } catch (seedErr) {
        console.warn(`[Database Auto-Init Warning] ${seedErr.message}`);
      }

      return mongoose.connection;
    } catch (mongoErr) {
      console.warn(`[Database Warning] MongoDB connection failed: ${mongoErr.message}`);
      console.warn('[Database Fallback] Falling back to SQLite local database.');
    }
  }

  // 2. SQLite Database Setup
  dbType = 'sqlite';
  if (db) return db;

  if (customPath) {
    dbPath = customPath;
  } else if (process.env.SQLITE_DB_PATH) {
    dbPath = path.isAbsolute(process.env.SQLITE_DB_PATH)
      ? process.env.SQLITE_DB_PATH
      : path.resolve(__dirname, '..', '..', process.env.SQLITE_DB_PATH);
  } else if (process.env.NODE_ENV === 'test') {
    dbPath = ':memory:';
  } else {
    dbPath = path.resolve(__dirname, '..', '..', 'data', 'placement.db');
  }

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Open SQLite database using Node's built-in DatabaseSync
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') {
    try {
      db.exec('PRAGMA journal_mode = WAL;');
    } catch (_) {}
  }

  // Execute DDL
  db.exec(SCHEMA_DDL);
  runSQLiteMigrations(db);

  // Auto-seed Top 50 Companies
  try {
    const { seedTop50Companies } = require('./seedCompanies');
    seedTop50Companies().catch((err) => console.warn(`[Auto-Seed Companies] ${err.message}`));
  } catch (_) {}

  const displayPath = dbPath === ':memory:' ? ':memory: (in-memory)' : path.resolve(dbPath);
  console.log(`[Database] SQLite connected successfully: ${displayPath}`);

  return db;
};

/**
 * Disconnect active database
 */
const disconnectDB = async () => {
  if (dbType === 'mongodb' && mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      console.log('[Database] MongoDB connection closed gracefully.');
    } catch (err) {
      console.error(`[Database Error] Error closing MongoDB: ${err.message}`);
    }
  }

  if (db) {
    try {
      db.close();
      console.log('[Database] SQLite connection closed gracefully.');
    } catch (err) {
      console.error(`[Database Error] Error closing SQLite: ${err.message}`);
    } finally {
      db = null;
    }
  }
};

const runSQLiteMigrations = (dbInstance) => {
  if (!dbInstance) return;
  const migrations = [
    "ALTER TABLE users ADD COLUMN collegeName TEXT DEFAULT 'COEP Technological University';",
    "ALTER TABLE users ADD COLUMN googleId TEXT DEFAULT NULL;",
    "ALTER TABLE users ADD COLUMN avatarUrl TEXT DEFAULT NULL;",
    "ALTER TABLE users ADD COLUMN authProvider TEXT DEFAULT 'local';",
    "ALTER TABLE student_profiles ADD COLUMN collegeName TEXT DEFAULT 'COEP Technological University';",
    "ALTER TABLE placement_drives ADD COLUMN collegeSpecificCriteria TEXT DEFAULT '[]';",
    "ALTER TABLE audit_logs ADD COLUMN updatedAt TEXT DEFAULT '';",
    "ALTER TABLE audit_logs ADD COLUMN entityType TEXT DEFAULT '';",
    "ALTER TABLE audit_logs ADD COLUMN entityId TEXT DEFAULT NULL;",
    "ALTER TABLE audit_logs ADD COLUMN userAgent TEXT DEFAULT '';",
    "ALTER TABLE placement_results ADD COLUMN packageOffered REAL DEFAULT 0;",
    "ALTER TABLE placement_results ADD COLUMN designation TEXT DEFAULT 'Software Engineer';",
    "ALTER TABLE placement_results ADD COLUMN joinedDate TEXT DEFAULT NULL;",
    "ALTER TABLE placement_results ADD COLUMN remarks TEXT DEFAULT '';",
    "ALTER TABLE interview_schedules ADD COLUMN mode TEXT DEFAULT 'virtual';",
    "ALTER TABLE interview_schedules ADD COLUMN meetingLink TEXT DEFAULT '';",
    "ALTER TABLE interview_schedules ADD COLUMN location TEXT DEFAULT '';",
    "ALTER TABLE interview_schedules ADD COLUMN scheduledBy TEXT DEFAULT NULL;",
  ];

  for (const sql of migrations) {
    try {
      dbInstance.exec(sql);
    } catch (_) {}
  }
};

/**
 * Get active SQLite instance (used by SQLite BaseModel)
 */
const getDB = () => {
  if (!db) {
    let targetPath = ':memory:';
    if (process.env.SQLITE_DB_PATH) {
      targetPath = path.isAbsolute(process.env.SQLITE_DB_PATH)
        ? process.env.SQLITE_DB_PATH
        : path.resolve(__dirname, '..', '..', process.env.SQLITE_DB_PATH);
    } else if (process.env.NODE_ENV !== 'test') {
      targetPath = path.resolve(__dirname, '..', '..', 'data', 'placement.db');
    }

    if (targetPath !== ':memory:') {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(targetPath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(SCHEMA_DDL);
    runSQLiteMigrations(db);
    dbPath = targetPath;
  }
  return db;
};

const isMongoActive = () => {
  return dbType === 'mongodb' && mongoose.connection && mongoose.connection.readyState === 1;
};

const getDBType = () => dbType;

// Compatibility mock connection object for health check endpoints
const connection = {
  get readyState() {
    if (dbType === 'mongodb') {
      return mongoose.connection.readyState;
    }
    return db ? 1 : 0;
  },
  get host() {
    if (dbType === 'mongodb') {
      return mongoose.connection.host || 'MongoDB Atlas';
    }
    return dbPath || 'localhost';
  },
  get name() {
    if (dbType === 'mongodb') {
      return mongoose.connection.name || 'placecloud';
    }
    return 'placement.db';
  },
  get dbType() {
    return dbType;
  },
};

module.exports = {
  connectDB,
  disconnectDB,
  getDB,
  connection,
  isMongoActive,
  getDBType,
  mongoose,
};
