const bcrypt = require('bcryptjs');
const { BaseModel, registerModel } = require('./BaseModel');
const MongoUser = require('./mongoose/User');
const { createModelBridge } = require('./modelBridge');

class User extends BaseModel {
  static tableName = 'users';
  static booleanFields = ['isActive'];

  constructor(data = {}) {
    super(data);
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
    if (this.isActive === undefined) {
      this.isActive = true;
    }
    if (this.authProvider === undefined) {
      this.authProvider = 'local';
    }
  }

  async save() {
    // Hash password if it is not already a bcrypt hash
    if (this.password && !this.password.startsWith('$2')) {
      const salt = bcrypt.genSaltSync(10);
      this.password = bcrypt.hashSync(this.password, salt);
    }
    return super.save();
  }

  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  toObject() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  static _fromRow(row, includePassword = false) {
    if (!row) return null;
    const instance = super._fromRow(row);
    if (!includePassword) {
      delete instance.password;
    }
    return instance;
  }
}

registerModel('User', User);

module.exports = createModelBridge(User, MongoUser);
