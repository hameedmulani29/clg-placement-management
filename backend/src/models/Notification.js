const { BaseModel, registerModel } = require('./BaseModel');
const MongoNotification = require('./mongoose/Notification');
const { createModelBridge } = require('./modelBridge');

class Notification extends BaseModel {
  static tableName = 'notifications';
  static booleanFields = ['isRead'];
  static jsonFields = ['metadata'];
  static relations = {
    recipientId: 'User',
  };

  constructor(data = {}) {
    super(data);
    if (this.isRead === undefined) this.isRead = false;
    if (!this.type) this.type = 'system';
    if (!this.metadata) this.metadata = {};
  }
}

registerModel('Notification', Notification);

module.exports = createModelBridge(Notification, MongoNotification);
