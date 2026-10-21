const { BaseModel, registerModel } = require('./BaseModel');
const MongoAuditLog = require('./mongoose/AuditLog');
const { createModelBridge } = require('./modelBridge');

class AuditLog extends BaseModel {
  static tableName = 'audit_logs';
  static jsonFields = ['changes'];
  static relations = {
    performedBy: 'User',
  };

  constructor(data = {}) {
    super(data);
    if (!this.changes) this.changes = {};
    if (this.ipAddress === undefined) this.ipAddress = '';
  }
}

registerModel('AuditLog', AuditLog);

module.exports = createModelBridge(AuditLog, MongoAuditLog);
