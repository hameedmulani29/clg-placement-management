const mongoose = require('mongoose');

const placementResultSchema = new mongoose.Schema(
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    status: {
      type: String,
      enum: ['offered', 'accepted', 'rejected'],
      default: 'offered',
    },
    packageOffered: {
      type: Number,
      default: 0,
    },
    offeredSalary: {
      type: Number,
      default: 0,
    },
    designation: {
      type: String,
      default: 'Software Engineer',
      trim: true,
    },
    offerLetterUrl: {
      type: String,
      default: '',
    },
    selectionDate: {
      type: Date,
      default: Date.now,
    },
    joinedDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to synchronize packageOffered and offeredSalary
placementResultSchema.pre('save', function () {
  if (this.offeredSalary && !this.packageOffered) {
    this.packageOffered = this.offeredSalary;
  }
  if (this.packageOffered && !this.offeredSalary) {
    this.offeredSalary = this.packageOffered;
  }
});

const MongoPlacementResult =
  mongoose.models.PlacementResult || mongoose.model('PlacementResult', placementResultSchema);

module.exports = MongoPlacementResult;
