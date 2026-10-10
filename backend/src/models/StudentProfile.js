const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    collegeId: {
      type: String,
      required: [true, 'College Registration / Roll ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: [
          'Computer Science',
          'Information Technology',
          'Electronics & Communication',
          'Electrical Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
        ],
        message: 'Invalid department selected',
      },
      index: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [2020, 'Graduation year cannot be earlier than 2020'],
      max: [2035, 'Graduation year cannot exceed 2035'],
      index: true,
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0.0, 'CGPA cannot be negative'],
      max: [10.0, 'CGPA cannot exceed 10.0'],
      index: true,
    },
    activeBacklogs: {
      type: Number,
      required: [true, 'Active backlogs count is required'],
      min: [0, 'Active backlogs cannot be negative'],
      default: 0,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    certifications: [
      {
        name: { type: String, trim: true },
        issuer: { type: String, trim: true },
        year: { type: Number },
      },
    ],
    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        link: { type: String, trim: true },
      },
    ],
    resumeS3Key: {
      type: String,
      default: null,
    },
    resumeOriginalName: {
      type: String,
      default: null,
    },
    resumeUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual helper for full name
studentProfileSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Configure JSON serialization to include virtuals
studentProfileSchema.set('toJSON', { virtuals: true });
studentProfileSchema.set('toObject', { virtuals: true });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
