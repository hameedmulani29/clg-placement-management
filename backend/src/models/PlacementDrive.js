const mongoose = require('mongoose');

const selectionRoundSchema = new mongoose.Schema(
  {
    roundNumber: {
      type: Number,
      required: true,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const placementDriveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Placement drive title is required'],
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Target company is required'],
      index: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    jobLocations: {
      type: [String],
      default: ['Bangalore', 'Hyderabad'],
    },
    salaryPackage: {
      ctc: {
        type: Number,
        required: [true, 'Annual CTC is required'],
        min: [0, 'CTC cannot be negative'],
      },
      base: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      stipend: {
        type: Number,
        default: 0,
      },
    },
    eligibilityCriteria: {
      minCgpa: {
        type: Number,
        required: [true, 'Minimum CGPA threshold is required'],
        min: 0.0,
        max: 10.0,
        default: 6.0,
      },
      allowedDepartments: {
        type: [String],
        required: [true, 'Allowed departments are required'],
        default: ['Computer Science', 'Information Technology'],
      },
      graduationYear: {
        type: Number,
        required: [true, 'Target graduation year is required'],
      },
      maxBacklogs: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
    },
    selectionRounds: {
      type: [selectionRoundSchema],
      default: [
        { roundNumber: 1, roundName: 'Online Aptitude & Coding Test', description: 'MCQ & 2 algorithm problems' },
        { roundNumber: 2, roundName: 'Technical Interview', description: 'DSA, System Design, and Projects' },
        { roundNumber: 3, roundName: 'HR & Cultural Fit Round', description: 'Leadership principles and offer discussion' },
      ],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive start date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        message: 'Invalid drive status',
      },
      default: 'upcoming',
      index: true,
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

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);

module.exports = PlacementDrive;
