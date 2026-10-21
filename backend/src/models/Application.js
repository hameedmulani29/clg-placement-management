const { BaseModel, registerModel } = require('./BaseModel');
const MongoApplication = require('./mongoose/Application');
const { createModelBridge } = require('./modelBridge');

class Application extends BaseModel {
  static tableName = 'applications';
  static relations = {
    placementDriveId: 'PlacementDrive',
    studentId: 'StudentProfile',
  };

  constructor(data = {}) {
    super(data);
    if (!this.status) this.status = 'applied';
    if (this.currentRound === undefined) this.currentRound = 1;
    if (!this.appliedDate) this.appliedDate = new Date().toISOString();
    if (this.notes === undefined) this.notes = '';
    if (this.resumeSnapshotKey === undefined) this.resumeSnapshotKey = null;
  }
}

registerModel('Application', Application);

module.exports = createModelBridge(Application, MongoApplication);
