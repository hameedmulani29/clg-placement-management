const InterviewSchedule = require('../models/InterviewSchedule');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Schedule an interview for an applicant (Admin & Recruiter)
 * POST /api/v1/interviews
 */
const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      roundNumber,
      roundName,
      scheduledDate,
      locationOrMeetingLink,
      instructions,
    } = req.body;

    if (!applicationId || !roundNumber || !roundName || !scheduledDate || !locationOrMeetingLink) {
      return errorResponse(res, 400, 'Please provide all required interview scheduling fields.');
    }

    const application = await Application.findById(applicationId)
      .populate('placementDriveId')
      .populate('studentId');

    if (!application) {
      return errorResponse(res, 404, 'Application not found.');
    }

    // Authorization check for recruiter
    if (req.user.role === 'recruiter') {
      const recruiter = await RecruiterProfile.findOne({ userId: req.user._id });
      if (!recruiter || application.placementDriveId.companyId.toString() !== recruiter.companyId.toString()) {
        return errorResponse(res, 403, 'Forbidden: You cannot schedule interviews for another company.');
      }
    }

    // Create interview record
    const interview = new InterviewSchedule({
      applicationId: application._id,
      placementDriveId: application.placementDriveId._id,
      studentId: application.studentId._id,
      roundNumber: Number(roundNumber),
      roundName: roundName.trim(),
      scheduledDate: new Date(scheduledDate),
      locationOrMeetingLink: locationOrMeetingLink.trim(),
      instructions: instructions || '',
      status: 'scheduled',
    });

    await interview.save();

    // Advance application status to interview_scheduled
    application.status = 'interview_scheduled';
    application.currentRound = Number(roundNumber);
    await application.save();

    // Send high-priority notification to the student
    const formattedDate = new Date(scheduledDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    await Notification.create({
      recipientId: application.studentId.userId,
      title: `Interview Call: Round ${roundNumber} - ${roundName}`,
      message: `You have an interview scheduled for ${application.placementDriveId.title} on ${formattedDate}. Link/Venue: ${locationOrMeetingLink}`,
      type: 'interview',
      metadata: { interviewId: interview._id, applicationId: application._id },
    });

    await AuditLog.create({
      action: 'INTERVIEW_SCHEDULED',
      performedBy: req.user._id,
      targetEntity: 'InterviewSchedule',
      targetEntityId: interview._id,
      changes: { roundNumber, roundName, scheduledDate },
      ipAddress: req.ip || '',
    });

    return successResponse(res, 201, 'Interview scheduled successfully.', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's upcoming interviews (Student only)
 * GET /api/v1/interviews/my-schedule
 */
const getMyInterviews = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return errorResponse(res, 404, 'Student profile not found.');
    }

    const interviews = await InterviewSchedule.find({ studentId: studentProfile._id })
      .populate({
        path: 'placementDriveId',
        populate: { path: 'companyId', select: 'name logoUrl industry' },
      })
      .sort({ scheduledDate: 1 });

    return successResponse(res, 200, 'Interview schedules retrieved.', interviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Update interview status and provide feedback (Admin & Recruiter)
 * PATCH /api/v1/interviews/:id
 */
const updateInterview = async (req, res, next) => {
  try {
    const { status, interviewerFeedback } = req.body;

    const interview = await InterviewSchedule.findById(req.params.id)
      .populate('placementDriveId')
      .populate('studentId');

    if (!interview) {
      return errorResponse(res, 404, 'Interview schedule not found.');
    }

    if (status) interview.status = status;
    if (interviewerFeedback !== undefined) interview.interviewerFeedback = interviewerFeedback;

    await interview.save();

    return successResponse(res, 200, 'Interview status updated successfully.', interview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews,
  updateInterview,
};
