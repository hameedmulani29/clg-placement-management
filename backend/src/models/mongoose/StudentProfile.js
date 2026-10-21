const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    collegeId: {
      type: String,
      required: [true, 'College ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    collegeName: {
      type: String,
      default: 'COEP Technological University',
      trim: true,
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
      trim: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.00'],
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: [0, 'Active backlogs cannot be negative'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    projects: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        link: { type: String, default: '' },
        techStack: { type: [String], default: [] },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentProfileSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

const MongoStudentProfile =
  mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);

module.exports = MongoStudentProfile;
