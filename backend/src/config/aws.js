const { S3Client } = require('@aws-sdk/client-s3');

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'college-placement-resumes-dev';

let s3Client = null;
let isS3Configured = false;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    isS3Configured = true;
    console.log(`[Cloud Storage] AWS S3 client initialized for bucket: ${bucketName} in region: ${region}`);
  } catch (err) {
    console.warn(`[Cloud Storage Warning] Failed to initialize S3 client: ${err.message}. Falling back to local storage.`);
  }
} else {
  console.log('[Cloud Storage] AWS S3 credentials not provided. Running with local sandboxed file storage fallback.');
}

module.exports = {
  s3Client,
  bucketName,
  region,
  isS3Configured,
};
