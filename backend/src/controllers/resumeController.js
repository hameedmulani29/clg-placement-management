const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const { uploadResumeBuffer, generatePresignedResumeUrl } = require('../services/s3Service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Upload student resume (PDF/DOCX) to Amazon S3
 * POST /api/v1/resumes/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please select a resume file to upload.');
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return errorResponse(res, 404, 'Student profile not found. Please register first.');
    }

    // Pipe buffer to AWS S3 (or dev fallback)
    const uploadResult = await uploadResumeBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      studentProfile._id
    );

    // Update student profile document
    studentProfile.resumeS3Key = uploadResult.s3Key;
    studentProfile.resumeOriginalName = uploadResult.originalName;
    studentProfile.resumeUpdatedAt = new Date();
    await studentProfile.save();

    return successResponse(res, 200, 'Resume uploaded successfully.', {
      resumeS3Key: uploadResult.s3Key,
      resumeOriginalName: uploadResult.originalName,
      resumeUpdatedAt: studentProfile.resumeUpdatedAt,
      isCloudStorage: uploadResult.isCloudStorage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mint a secure time-limited (15-min) Presigned S3 URL to view a student's resume
 * GET /api/v1/resumes/view/:studentId
 */
const getResumeDownloadUrl = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const studentProfile = await StudentProfile.findById(studentId);
    if (!studentProfile) {
      return errorResponse(res, 404, 'Student profile not found.');
    }

    if (!studentProfile.resumeS3Key) {
      return errorResponse(res, 404, 'No resume document has been uploaded by this candidate yet.');
    }

    // Authorization Verification
    if (req.user.role === 'student') {
      // Students can only view their own resume
      if (studentProfile.userId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Forbidden: You cannot access another student’s confidential resume.');
      }
    } else if (req.user.role === 'recruiter') {
      // Recruiters can only view resumes of students who applied to their company's drives
      const recruiter = await RecruiterProfile.findOne({ userId: req.user._id });
      if (!recruiter) {
        return errorResponse(res, 403, 'Recruiter profile not found.');
      }

      const companyDrives = await PlacementDrive.find({ companyId: recruiter.companyId }).select('_id');
      const companyDriveIds = companyDrives.map((d) => d._id);

      const hasApplication = await Application.exists({
        placementDriveId: { $in: companyDriveIds },
        studentId: studentProfile._id,
      });

      if (!hasApplication) {
        return errorResponse(
          res,
          403,
          'Forbidden: You can only view resumes of candidates who applied to your company drives.'
        );
      }
    }
    // Admin is authorized to access any student resume

    // Generate 15-minute Presigned URL
    const presignedUrl = await generatePresignedResumeUrl(studentProfile.resumeS3Key, 900);

    return successResponse(res, 200, 'Secure resume view URL generated.', {
      downloadUrl: presignedUrl,
      originalName: studentProfile.resumeOriginalName,
      expiresInSeconds: 900,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumeDownloadUrl,
};
