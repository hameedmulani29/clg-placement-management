const { BaseModel, registerModel } = require('./BaseModel');
const MongoRecruiterProfile = require('./mongoose/RecruiterProfile');
const { createModelBridge } = require('./modelBridge');

class RecruiterProfile extends BaseModel {
  static tableName = 'recruiter_profiles';
  static booleanFields = ['isVerified'];
  static relations = {
    userId: 'User',
    companyId: 'Company',
  };

  constructor(data = {}) {
    super(data);
    if (this.phone === undefined) this.phone = '';
    if (this.isVerified === undefined) this.isVerified = true;
  }
}

registerModel('RecruiterProfile', RecruiterProfile);

module.exports = createModelBridge(RecruiterProfile, MongoRecruiterProfile);
