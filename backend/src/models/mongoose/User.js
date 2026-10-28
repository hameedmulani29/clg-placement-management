const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'admin', 'recruiter'],
      default: 'student',
    },
    collegeName: {
      type: String,
      default: 'COEP Technological University',
      trim: true,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Omit password from JSON serialization
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = MongoUser;
