const { BaseModel, registerModel } = require('./BaseModel');
const { getDB } = require('../config/db');
const MongoStudentProfile = require('./mongoose/StudentProfile');
const { createModelBridge } = require('./modelBridge');

class StudentProfile extends BaseModel {
  static tableName = 'student_profiles';
  static jsonFields = ['skills', 'certifications', 'projects'];
  static relations = {
    userId: 'User',
  };

  constructor(data = {}) {
    super(data);
    if (!this.skills) this.skills = [];
    if (!this.certifications) this.certifications = [];
    if (!this.projects) this.projects = [];
    if (this.activeBacklogs === undefined) this.activeBacklogs = 0;
  }

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  toJSON() {
    const obj = super.toJSON();
    obj.fullName = this.fullName;
    return obj;
  }

  toObject() {
    const obj = super.toObject();
    obj.fullName = this.fullName;
    return obj;
  }

  static async aggregate(pipeline = []) {
    const db = getDB();
    // Department-wise distribution aggregation
    const rows = db
      .prepare(
        `SELECT department as _id, COUNT(*) as totalStudents, AVG(cgpa) as averageCgpa
         FROM student_profiles
         GROUP BY department`
      )
      .all();

    return rows.map((r) => ({
      _id: r._id,
      totalStudents: Number(r.totalStudents),
      averageCgpa: Number(r.averageCgpa) || 0,
    }));
  }
}

registerModel('StudentProfile', StudentProfile);

module.exports = createModelBridge(StudentProfile, MongoStudentProfile);
