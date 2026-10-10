const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Verifies if the authenticated user possesses one of the authorized roles
 * @param  {...string} roles Allowed roles (e.g. 'admin', 'recruiter', 'student')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized request. Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: [${roles.join(', ')}]`
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
