const { BaseModel, registerModel } = require('./BaseModel');
const MongoPlacementDrive = require('./mongoose/PlacementDrive');
const { createModelBridge } = require('./modelBridge');

class PlacementDrive extends BaseModel {
  static tableName = 'placement_drives';
  static jsonFields = ['jobLocations', 'salaryPackage', 'eligibilityCriteria', 'collegeSpecificCriteria', 'selectionRounds'];
  static relations = {
    companyId: 'Company',
    createdBy: 'User',
  };

  constructor(data = {}) {
    super(data);
    if (!this.jobLocations) {
      this.jobLocations = ['Bangalore', 'Hyderabad'];
    }
    if (!this.collegeSpecificCriteria) {
      this.collegeSpecificCriteria = [];
    }
    if (!this.selectionRounds) {
      this.selectionRounds = [
        { roundNumber: 1, roundName: 'Online Aptitude & Coding Test', description: 'MCQ & 2 algorithm problems' },
        { roundNumber: 2, roundName: 'Technical Interview', description: 'DSA, System Design, and Projects' },
        { roundNumber: 3, roundName: 'HR & Cultural Fit Round', description: 'Leadership principles and offer discussion' },
      ];
    }
    if (!this.status) {
      this.status = 'upcoming';
    }
    if (this.applicationDeadline instanceof Date) {
      this.applicationDeadline = this.applicationDeadline.toISOString();
    }
    if (this.driveDate instanceof Date) {
      this.driveDate = this.driveDate.toISOString();
    }
  }

  async save() {
    if (this.applicationDeadline instanceof Date) {
      this.applicationDeadline = this.applicationDeadline.toISOString();
    }
    if (this.driveDate instanceof Date) {
      this.driveDate = this.driveDate.toISOString();
    }
    return super.save();
  }
}

registerModel('PlacementDrive', PlacementDrive);

module.exports = createModelBridge(PlacementDrive, MongoPlacementDrive);
