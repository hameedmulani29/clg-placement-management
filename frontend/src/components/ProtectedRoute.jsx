import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { getRoleDashboardPath } from '../utils/roleRoutes';
import CompleteStudentProfilePage from '../pages/CompleteStudentProfilePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Verifying security credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!getRoleDashboardPath(user?.role) || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (user.role === 'student' && !profile) {
    return (
      <>
        <div aria-hidden="true" inert="">
          {children}
        </div>
        <CompleteStudentProfilePage />
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
