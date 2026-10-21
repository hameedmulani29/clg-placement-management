const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    placementDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
      default: 'applied',
    },
    currentRound: {
      type: Number,
      default: 1,
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

// Prevent duplicate applications from the same student to the same drive
applicationSchema.index({ placementDriveId: 1, studentId: 1 }, { unique: true });

const MongoApplication =
  mongoose.models.Application || mongoose.model('Application', applicationSchema);

module.exports = MongoApplication;
