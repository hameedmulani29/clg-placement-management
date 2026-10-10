const mongoose = require('mongoose');

const interviewScheduleSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application ID is required'],
      index: true,
    },
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
    roundNumber: {
      type: Number,
      required: [true, 'Round number is required'],
      min: 1,
    },
    roundName: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
      index: true,
    },
    locationOrMeetingLink: {
      type: String,
      required: [true, 'Interview location or online meeting link is required'],
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'completed', 'cancelled'],
        message: 'Invalid interview status',
      },
      default: 'scheduled',
      index: true,
    },
    interviewerFeedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const InterviewSchedule = mongoose.model('InterviewSchedule', interviewScheduleSchema);

module.exports = InterviewSchedule;
