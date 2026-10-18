import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, User, LogOut, CheckCheck, Cloud } from 'lucide-react';

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=5');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Placement Officer';
      case 'recruiter':
        return 'Corporate Recruiter';
      case 'student':
        return 'Student';
      default:
        return 'Guest';
    }
  };

  const displayName = profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : user?.email;

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '1.25rem' }}>
          <div style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
            <Cloud size={20} />
          </div>
          <span>PlaceCloud</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              position: 'relative',
              background: '#f1f5f9',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '320px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ background: 'none', color: '#4f46e5', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #f8fafc',
                        backgroundColor: n.isRead ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '0.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                <Link
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' }}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{displayName}</div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: user?.role === 'admin' ? '#7c3aed' : user?.role === 'recruiter' ? '#0284c7' : '#059669',
                backgroundColor: user?.role === 'admin' ? '#f5f3ff' : user?.role === 'recruiter' ? '#f0f9ff' : '#ecfdf5',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              {getRoleLabel()}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
