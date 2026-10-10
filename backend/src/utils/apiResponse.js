/**
 * Standardized API Response Utilities
 */

/**
 * Send a success response
 * @param {Response} res Express response object
 * @param {number} statusCode HTTP status code (200, 201)
 * @param {string} message Human readable message
 * @param {any} data Response payload
 * @param {object} meta Optional metadata (pagination, filters, etc.)
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Response} res Express response object
 * @param {number} statusCode HTTP status code (400, 401, 403, 404, 500)
 * @param {string} message Error message
 * @param {any} errors Specific validation or error details
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit) || 1;
  return successResponse(res, 200, message, data, {
    pagination: {
      currentPage: Number(page),
      limit: Number(limit),
      totalRecords: Number(total),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
