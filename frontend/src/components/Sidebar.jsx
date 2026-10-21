import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  FileCheck2,
  Calendar,
  Building2,
  Users,
  BarChart3,
  Bell,
  GraduationCap,
  Shield,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'Profile & Resume', icon: UserCheck },
    { to: '/drives', label: 'Placement Drives', icon: Briefcase },
    { to: '/applications', label: 'My Applications', icon: FileCheck2 },
    { to: '/interviews', label: 'Interview Calls', icon: Calendar },
    { to: '/companies', label: 'Companies', icon: Building2 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/drives', label: 'Manage Drives', icon: Briefcase },
    { to: '/admin/students', label: 'Student Directory', icon: Users },
    { to: '/admin/companies', label: 'Company Partners', icon: Building2 },
    { to: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/notifications', label: 'System Alerts', icon: Bell },
  ];

  const recruiterLinks = [
    { to: '/recruiter', label: 'Recruiter Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/drives', label: 'Company Drives', icon: Briefcase },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  let links = [];
  let roleTitle = 'Placement Portal';
  let RoleIcon = GraduationCap;
  let roleTag = 'Campus Operations';

  if (user?.role === 'admin') {
    links = adminLinks;
    roleTitle = 'TPO Command';
    RoleIcon = Shield;
    roleTag = 'Institutional Admin';
  } else if (user?.role === 'recruiter') {
    links = recruiterLinks;
    roleTitle = 'Talent Portal';
    RoleIcon = Briefcase;
    roleTag = profile?.companyId?.name || 'Recruiting Partner';
  } else {
    links = studentLinks;
    roleTitle = 'Student Portal';
    RoleIcon = GraduationCap;
    roleTag = profile?.department || 'Candidate Suite';
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <RoleIcon size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 'var(--font-weight-extrabold)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {roleTitle}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {roleTag}
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs"
            style={{ display: 'none', padding: '0.25rem' }}
            aria-label="Close sidebar navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation links */}
        <nav
          style={{
            padding: '1rem 0.75rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            overflowY: 'auto',
          }}
        >
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard' || link.to === '/admin' || link.to === '/recruiter'}
                onClick={() => {
                  if (window.innerWidth <= 900 && onClose) {
                    onClose();
                  }
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                })}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
