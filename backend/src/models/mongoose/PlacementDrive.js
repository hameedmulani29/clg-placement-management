const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    jobLocations: {
      type: [String],
      default: ['Bangalore', 'Hyderabad'],
    },
    salaryPackage: {
      ctc: { type: Number, default: 0 },
      baseSalary: { type: Number, default: 0 },
      breakdown: { type: String, default: '' },
    },
    eligibilityCriteria: {
      minCgpa: { type: Number, default: 6.0 },
      maxBacklogs: { type: Number, default: 0 },
      allowedDepartments: { type: [String], default: [] },
      graduationYear: { type: Number },
    },
    collegeSpecificCriteria: [
      {
        collegeName: { type: String, required: true },
        minCgpa: { type: Number, default: 6.0 },
        maxBacklogs: { type: Number, default: 0 },
        allowedDepartments: { type: [String], default: [] },
        customPackage: { type: String, default: '' },
        performanceRecord: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],
    selectionRounds: [
      {
        roundNumber: { type: Number, required: true },
        roundName: { type: String, required: true },
        description: { type: String, default: '' },
      },
    ],
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongoPlacementDrive =
  mongoose.models.PlacementDrive || mongoose.model('PlacementDrive', placementDriveSchema);

module.exports = MongoPlacementDrive;
