const path = require('path');
const fs = require('fs');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, bucketName, isS3Configured } = require('../config/aws');

// Ensure local uploads directory exists for offline fallback
const LOCAL_UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

/**
 * Upload student resume buffer to Amazon S3 (or local sandboxed storage fallback)
 * @param {Buffer} fileBuffer File buffer from Multer memoryStorage
 * @param {string} originalName Original uploaded filename
 * @param {string} mimeType File MIME type
 * @param {string} studentId StudentProfile ObjectId
 * @returns {Promise<{ s3Key: string, originalName: string, isCloudStorage: boolean }>}
 */
const uploadResumeBuffer = async (fileBuffer, originalName, mimeType, studentId) => {
  // Sanitize filename and create unique storage key
  const safeFilename = path.basename(originalName).replace(/[^a-zA-Z0-9.-]/g, '_');
  const s3Key = `resumes/${studentId}/${Date.now()}-${safeFilename}`;

  if (isS3Configured && s3Client) {
    // Cloud Upload: Amazon S3 with Server-Side Encryption (SSE-S3)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256', // Encryption at rest
      Metadata: {
        studentId: studentId.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);
    console.log(`[Cloud Storage] Successfully uploaded resume to S3: s3://${bucketName}/${s3Key}`);

    return {
      s3Key,
      originalName,
      isCloudStorage: true,
    };
  } else {
    // Local Sandbox Fallback (Zero AWS cost, offline development)
    const destinationPath = path.join(LOCAL_UPLOADS_DIR, s3Key);
    const destinationFolder = path.dirname(destinationPath);

    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    fs.writeFileSync(destinationPath, fileBuffer);
    console.log(`[Local Storage Fallback] Saved resume to local directory: ${destinationPath}`);

    return {
      s3Key,
      originalName,
      isCloudStorage: false,
    };
  }
};

/**
 * Generate a time-limited Presigned URL (15-min) to view or download a private resume
 * @param {string} s3Key S3 object key
 * @param {number} expiresInSeconds Expiration lifetime (default 900s = 15 minutes)
 * @returns {Promise<string>} Ephemeral presigned URL or sandboxed local URL
 */
const generatePresignedResumeUrl = async (s3Key, expiresInSeconds = 900) => {
  if (isS3Configured && s3Client) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    // Generate signed URL that expires in 15 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return presignedUrl;
  } else {
    // Return relative path served by Express static server
    return `/uploads/${s3Key}`;
  }
};

module.exports = {
  uploadResumeBuffer,
  generatePresignedResumeUrl,
};
