import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';

const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* WCAG Skip to Main Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

      <div className="main-content">
        <Navbar
          onToggleMobileSidebar={toggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
        <main id="main-content" className="page-body" tabIndex="-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
