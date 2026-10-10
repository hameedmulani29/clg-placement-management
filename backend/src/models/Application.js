const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    placementDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student profile ID is required'],
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
        message: 'Invalid application status',
      },
      default: 'applied',
      index: true,
    },
    currentRound: {
      type: Number,
      default: 1,
      min: 1,
    },
    notes: {
      type: String,
      default: '',
    },
    resumeSnapshotKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Prevents duplicate applications for the same drive
applicationSchema.index({ placementDriveId: 1, studentId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
