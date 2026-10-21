const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'data', 'placement.db');
console.log('Migrating SQLite database at:', dbPath);

const db = new DatabaseSync(dbPath);

const stmts = [
  "ALTER TABLE users ADD COLUMN collegeName TEXT DEFAULT 'COEP Technological University';",
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
  "ALTER TABLE interview_schedules ADD COLUMN scheduledBy TEXT DEFAULT NULL;"
];

for (const s of stmts) {
  try {
    db.exec(s);
    console.log('[MIGRATION] Applied:', s);
  } catch (e) {
    if (e.message && e.message.includes('duplicate column name')) {
      console.log('[MIGRATION] Column already exists (skipped)');
    } else {
      console.warn('[MIGRATION] Note:', e.message);
    }
  }
}

console.log('Current audit_logs columns:', db.prepare('PRAGMA table_info(audit_logs)').all().map(c => c.name));
console.log('Current placement_results columns:', db.prepare('PRAGMA table_info(placement_results)').all().map(c => c.name));
console.log('Current interview_schedules columns:', db.prepare('PRAGMA table_info(interview_schedules)').all().map(c => c.name));
console.log('Migration complete!');
