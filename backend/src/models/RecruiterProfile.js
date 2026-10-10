const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Associated company is required'],
      index: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation / job title is required'],
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);

module.exports = RecruiterProfile;
