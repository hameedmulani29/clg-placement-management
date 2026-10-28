const roleRoutes = {
  student: '/dashboard',
  recruiter: '/recruiter',
  admin: '/admin',
};

export const getRoleDashboardPath = (role) =>
  Object.prototype.hasOwnProperty.call(roleRoutes, role) ? roleRoutes[role] : null;
