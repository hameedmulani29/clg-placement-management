const multer = require('multer');
const path = require('path');

// In-memory buffer storage so files can be piped directly to AWS S3
const storage = multer.memoryStorage();

// Allowed MIME types and file extensions
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error('Invalid file format. Only PDF and Word documents (.pdf, .doc, .docx) are accepted.');
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

// 5 MB maximum file size limit
const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = {
  resumeUpload,
};
