const { errorResponse } = require('../utils/apiResponse');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log error stack in non-production environments
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed for one or more fields';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle Mongoose CastError (Invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: '${err.path}' with provided value: '${err.value}'`;
  }

  // Handle MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicatedValue = err.keyValue ? err.keyValue[duplicatedField] : '';
    message = `Duplicate value '${duplicatedValue}' detected for '${duplicatedField}'. Must be unique.`;
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size limit exceeded. Maximum allowable file size is 5MB.';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  return errorResponse(res, statusCode, message, errors);
};

module.exports = {
  errorHandler,
};
