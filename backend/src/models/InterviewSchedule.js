const { BaseModel, registerModel } = require('./BaseModel');
const MongoInterviewSchedule = require('./mongoose/InterviewSchedule');
const { createModelBridge } = require('./modelBridge');

class InterviewSchedule extends BaseModel {
  static tableName = 'interview_schedules';
  static relations = {
    applicationId: 'Application',
    placementDriveId: 'PlacementDrive',
    studentId: 'StudentProfile',
  };

  constructor(data = {}) {
    super(data);
    if (!this.status) this.status = 'scheduled';
    if (this.instructions === undefined) this.instructions = '';
    if (this.interviewerFeedback === undefined) this.interviewerFeedback = '';
    if (this.scheduledDate instanceof Date) {
      this.scheduledDate = this.scheduledDate.toISOString();
    }
  }

  async save() {
    if (this.scheduledDate instanceof Date) {
      this.scheduledDate = this.scheduledDate.toISOString();
    }
    return super.save();
  }
}

registerModel('InterviewSchedule', InterviewSchedule);

module.exports = createModelBridge(InterviewSchedule, MongoInterviewSchedule);
