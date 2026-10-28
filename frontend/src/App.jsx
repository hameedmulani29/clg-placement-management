import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterStudentPage from './pages/RegisterStudentPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import DrivesListPage from './pages/DrivesListPage';
import DriveDetailsPage from './pages/DriveDetailsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import InterviewsPage from './pages/InterviewsPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminDrivesPage from './pages/AdminDrivesPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import AnalyticsReportsPage from './pages/AnalyticsReportsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/RecruiterDashboard';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-student" element={<RegisterStudentPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/complete-profile" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Student Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/profile" element={<StudentProfilePage />} />
        <Route path="/drives" element={<DrivesListPage />} />
        <Route path="/drives/:id" element={<DriveDetailsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/companies" element={<AdminCompaniesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Protected Admin / Placement Officer Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/drives" element={<AdminDrivesPage />} />
        <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/admin/companies" element={<AdminCompaniesPage />} />
        <Route path="/admin/analytics" element={<AnalyticsReportsPage />} />
      </Route>

      {/* Protected Recruiter Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/drives" element={<AdminDrivesPage />} />
        <Route path="/recruiter/applications" element={<RecruiterDashboard />} />
        <Route path="/recruiter/interviews" element={<RecruiterDashboard />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
