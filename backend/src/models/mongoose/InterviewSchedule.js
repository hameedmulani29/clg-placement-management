const mongoose = require('mongoose');

const interviewScheduleSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
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
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    roundName: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true,
    },
    roundNumber: {
      type: Number,
      default: 1,
    },
    mode: {
      type: String,
      enum: ['in-person', 'virtual'],
      default: 'virtual',
    },
    locationOrMeetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    interviewerFeedback: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MongoInterviewSchedule =
  mongoose.models.InterviewSchedule || mongoose.model('InterviewSchedule', interviewScheduleSchema);

module.exports = MongoInterviewSchedule;
