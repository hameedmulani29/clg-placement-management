import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  Cloud,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Shield,
  Briefcase,
  GraduationCap,
  Loader2,
  Sparkles,
  Building,
} from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Signed in successfully', `Welcome to the PlaceCloud ${res.role} portal.`);
        if (res.role === 'admin') navigate('/admin');
        else if (res.role === 'recruiter') navigate('/recruiter');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Server connection failed. Please ensure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle({ role: activeRoleTab });
      if (res.success) {
        toast.success(
          res.isNewUser ? 'Welcome to PlaceCloud!' : 'Signed in with Google',
          `Logged in to the ${res.role} portal.`
        );
        if (res.role === 'admin') navigate('/admin');
        else if (res.role === 'recruiter') navigate('/recruiter');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      setError(
        err.message ||
          err.response?.data?.message ||
          'Google authentication failed. Please check your network and configuration.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword, role) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setActiveRoleTab(role);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-canvas)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99, 102, 241, 0.15), rgba(14, 165, 233, 0.08), transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />

      {/* Top Navigation Bar with Back to Home & Theme Toggle */}
      <header
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 10,
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link
          to="/"
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-full)',
              width: '36px',
              height: '36px',
            }}
            aria-label="Toggle visual theme"
          >
            {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <Link to="/register-student" className="btn btn-primary btn-sm">
            Student Intake <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Login Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.25rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: '460px' }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--text-primary)',
                fontWeight: 'var(--font-weight-extrabold)',
                fontSize: '1.6rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <Cloud size={24} />
              </div>
              <span>PlaceCloud</span>
            </Link>

            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 'var(--font-weight-extrabold)',
                color: 'var(--text-primary)',
                marginTop: '1.25rem',
                letterSpacing: '-0.025em',
              }}
            >
              Sign In to Your Portal
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: '0.35rem' }}>
              Access your role-based campus placement workspace
            </p>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-default)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('student');
                handleQuickLogin('arjun.sharma@college.edu', 'StudentPassword123!', 'student');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                backgroundColor: activeRoleTab === 'student' ? 'var(--bg-surface)' : 'transparent',
                color: activeRoleTab === 'student' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeRoleTab === 'student' ? 'var(--shadow-xs)' : 'none',
                border: activeRoleTab === 'student' ? '1px solid var(--border-default)' : '1px solid transparent',
              }}
            >
              <GraduationCap size={15} />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('recruiter');
                handleQuickLogin('recruiter.google@google.com', 'RecruiterPassword123!', 'recruiter');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                backgroundColor: activeRoleTab === 'recruiter' ? 'var(--bg-surface)' : 'transparent',
                color: activeRoleTab === 'recruiter' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeRoleTab === 'recruiter' ? 'var(--shadow-xs)' : 'none',
                border: activeRoleTab === 'recruiter' ? '1px solid var(--border-default)' : '1px solid transparent',
              }}
            >
              <Briefcase size={15} />
              <span>Recruiter</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('admin');
                handleQuickLogin('admin@college.edu', 'AdminPassword123!', 'admin');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                backgroundColor: activeRoleTab === 'admin' ? 'var(--bg-surface)' : 'transparent',
                color: activeRoleTab === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeRoleTab === 'admin' ? 'var(--shadow-xs)' : 'none',
                border: activeRoleTab === 'admin' ? '1px solid var(--border-default)' : '1px solid transparent',
              }}
            >
              <Shield size={15} />
              <span>TPO Admin</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-lg)' }}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--danger-text)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: '1.25rem',
                }}
                role="alert"
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                id="firebase-google-login-btn"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-xs)',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {googleLoading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 0.9s linear infinite', color: 'var(--primary)' }} />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>
                      Continue with Google ({activeRoleTab === 'admin' ? 'TPO Admin' : activeRoleTab.charAt(0).toUpperCase() + activeRoleTab.slice(1)})
                    </span>
                  </>
                )}
              </button>

              {!isFirebaseConfigured && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.5rem',
                  }}
                >
                  <Sparkles size={12} style={{ color: 'var(--color-accent-500)' }} />
                  <span>Firebase Google Auth ready • Add credentials to .env to enable</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '1.25rem 0 0.5rem 0',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                <span style={{ padding: '0 0.85rem' }}>or sign in with credentials</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">
                  Institutional / Corporate Email <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@college.edu or recruiter@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password" className="form-label" style={{ marginBottom: 0 }}>
                    Password <span className="required">*</span>
                  </label>
                </div>
                <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      padding: '0.25rem',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem', fontSize: 'var(--text-sm)', marginTop: '0.35rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to PlaceCloud <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>⚡ 1-Click Evaluation Credentials</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 'bold' }}>Auto-Fills Form</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickLogin('arjun.sharma@college.edu', 'StudentPassword123!', 'student')}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.55rem 0.85rem' }}
                >
                  <GraduationCap size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem' }}>
                    <strong>Student:</strong> Arjun Sharma (CS, 9.35 CGPA)
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickLogin('admin@college.edu', 'AdminPassword123!', 'admin')}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.55rem 0.85rem' }}
                >
                  <Shield size={16} style={{ color: 'var(--color-accent-600)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem' }}>
                    <strong>Admin:</strong> Placement Officer (TPO Cell)
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickLogin('recruiter.google@google.com', 'RecruiterPassword123!', 'recruiter')}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.55rem 0.85rem' }}
                >
                  <Briefcase size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem' }}>
                    <strong>Recruiter:</strong> Google Cloud Platform
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Navigation Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Are you a new candidate?{' '}
            <Link to="/register-student" style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
              Create student profile →
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            🔒 256-Bit Encrypted Session • Role-Based Access Isolation • PlaceCloud Enterprise
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
