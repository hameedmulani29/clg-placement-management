const mongoose = require('mongoose');

const placementResultSchema = new mongoose.Schema(
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
    offeredSalary: {
      type: Number,
      required: [true, 'Offered salary package (CTC) is required'],
      min: [0, 'Salary cannot be negative'],
    },
    offerLetterUrl: {
      type: String,
      default: '',
    },
    selectionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['offered', 'accepted', 'declined'],
        message: 'Invalid offer status',
      },
      default: 'offered',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Single result per student per placement drive
placementResultSchema.index({ placementDriveId: 1, studentId: 1 }, { unique: true });

const PlacementResult = mongoose.model('PlacementResult', placementResultSchema);

module.exports = PlacementResult;
