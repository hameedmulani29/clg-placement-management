const { BaseModel, registerModel } = require('./BaseModel');
const MongoCompany = require('./mongoose/Company');
const { createModelBridge } = require('./modelBridge');

class Company extends BaseModel {
  static tableName = 'companies';
  static booleanFields = ['isActive'];
  static relations = {
    createdBy: 'User',
  };

  constructor(data = {}) {
    super(data);
    if (this.isActive === undefined) this.isActive = true;
    if (this.website === undefined) this.website = '';
    if (this.description === undefined) this.description = '';
    if (this.logoUrl === undefined) this.logoUrl = '';
    if (this.contactPhone === undefined) this.contactPhone = '';
    if (this.address === undefined) this.address = '';
  }
}

registerModel('Company', Company);

module.exports = createModelBridge(Company, MongoCompany);
