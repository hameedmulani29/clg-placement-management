import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  Bell,
  LogOut,
  CheckCheck,
  Cloud,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  User,
  Shield,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

const Navbar = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { user, profile, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const themeRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowThemeMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return { label: 'Placement Officer', color: 'var(--color-accent-600)', bg: 'var(--color-accent-50)', icon: Shield };
      case 'recruiter':
        return { label: 'Recruiter', color: 'var(--color-info-600)', bg: 'var(--color-info-50)', icon: Briefcase };
      case 'student':
        return { label: 'Student', color: 'var(--color-success-600)', bg: 'var(--color-success-50)', icon: GraduationCap };
      default:
        return { label: 'Guest', color: 'var(--text-muted)', bg: 'var(--bg-surface-subtle)', icon: User };
    }
  };

  const roleMeta = getRoleBadge();
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`
    : user?.email?.split('@')[0] || 'User';

  const userInitials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName ? profile.lastName[0] : ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'recruiter') return '/recruiter';
    return '/dashboard';
  };

  return (
    <header className="top-navbar" role="banner">
      {/* Left side: Hamburger Trigger & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
          aria-label={isMobileSidebarOpen ? 'Close sidebar navigation' : 'Open sidebar navigation'}
          aria-expanded={isMobileSidebarOpen}
        >
          {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link
          to={getDashboardPath()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-extrabold)',
            fontSize: 'var(--text-lg)',
            textDecoration: 'none',
          }}
          title="PlaceCloud Dashboard"
        >
          <div
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Cloud size={19} />
          </div>
          <span style={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>PlaceCloud</span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 'var(--font-weight-bold)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Enterprise
            </span>
          </span>
        </Link>
      </div>

      {/* Right side controls: Theme Switcher, Notifications Popover, User Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Switcher Dropdown */}
        <div ref={themeRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-full)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle visual theme"
            aria-expanded={showThemeMenu}
          >
            {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {showThemeMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '150px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.35rem',
                zIndex: 100,
                animation: 'popover-in 0.15s var(--ease-out)',
              }}
            >
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTheme(opt.id);
                      setShowThemeMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: isSelected ? 'var(--font-weight-bold)' : 'normal',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      backgroundColor: isSelected ? 'var(--bg-surface-subtle)' : 'transparent',
                    }}
                  >
                    <Icon size={14} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary btn-sm"
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={`View notifications (${unreadCount} unread)`}
            aria-expanded={showNotifications}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 'var(--font-weight-bold)',
                  width: '17px',
                  height: '17px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-surface)',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '340px',
                maxWidth: 'calc(100vw - 2rem)',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-default)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'popover-in 0.15s var(--ease-out)',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-surface-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontSize: '0.7rem',
                        fontWeight: 'var(--font-weight-bold)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    style={{
                      color: 'var(--primary)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--bg-surface-subtle)',
                        transition: 'background-color var(--duration-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                          {n.title}
                        </div>
                        {!n.isRead && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                        {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '0.65rem', textAlign: 'center', backgroundColor: 'var(--bg-surface-subtle)', borderTop: '1px solid var(--border-default)' }}>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  View full inbox <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.65rem 0.35rem 0.35rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              transition: 'background-color var(--duration-fast), border-color var(--duration-fast)',
            }}
            aria-label="User account menu"
            aria-expanded={showUserMenu}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>

            <div style={{ textAlign: 'left', display: 'none', lineHeight: 1.15, '@media (minWidth: 768px)': { display: 'block' } }}>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayName}
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: roleMeta.color,
                }}
              >
                {roleMeta.label}
              </span>
            </div>

            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-default)',
                padding: '0.5rem',
                zIndex: 100,
                animation: 'popover-in 0.15s var(--ease-out)',
              }}
            >
              <div style={{ padding: '0.5rem 0.65rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 'var(--font-weight-bold)',
                      color: roleMeta.color,
                      backgroundColor: roleMeta.bg,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-block',
                    }}
                  >
                    {roleMeta.label}
                  </span>
                </div>
              </div>

              <div style={{ padding: '0.35rem 0' }}>
                {user?.role === 'student' && (
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                    }}
                  >
                    <User size={14} /> My Profile & Resume
                  </Link>
                )}

                <Link
                  to={getDashboardPath()}
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  <Cloud size={14} /> Portal Dashboard
                </Link>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--danger)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  <LogOut size={14} /> Sign Out of PlaceCloud
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
