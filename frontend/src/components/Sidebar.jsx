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
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

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
    { to: '/recruiter/drives', label: 'Manage Jobs / Drives', icon: Briefcase },
    { to: '/recruiter/applications', label: 'Applicant Pipeline', icon: Users },
    { to: '/recruiter/interviews', label: 'Interview Calendar', icon: Calendar },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  let links = [];
  if (user?.role === 'admin') links = adminLinks;
  else if (user?.role === 'recruiter') links = recruiterLinks;
  else links = studentLinks;

  return (
    <aside className="sidebar">
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: '#eef2ff', color: '#4f46e5', padding: '0.5rem', borderRadius: '10px' }}>
          <GraduationCap size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Campus Portal</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Placement Management</div>
        </div>
      </div>

      <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/admin' || link.to === '/recruiter'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#4f46e5' : '#475569',
                backgroundColor: isActive ? '#eef2ff' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={19} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>PlaceCloud v1.0</div>
          <div>AWS S3 & Atlas Connected</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
