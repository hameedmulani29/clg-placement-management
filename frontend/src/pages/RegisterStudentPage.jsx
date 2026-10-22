import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  Cloud,
  AlertCircle,
  CheckCircle2,
  User,
  GraduationCap,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Loader2,
  BookOpen,
  Mail,
  Phone,
  Code,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { CURATED_COLLEGES, DEFAULT_COLLEGE } from '../utils/colleges';

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

const RegisterStudentPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeId: '',
    collegeName: DEFAULT_COLLEGE,
    customCollegeName: '',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: '',
    activeBacklogs: 0,
    phone: '',
    skills: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { registerStudent, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const selectedCollege =
        formData.collegeName === 'OTHER'
          ? (formData.customCollegeName || '').trim()
          : formData.collegeName;

      const res = await loginWithGoogle({
        role: 'student',
        collegeName: selectedCollege || DEFAULT_COLLEGE,
        department: formData.department,
        graduationYear: Number(formData.graduationYear),
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : 8.0,
        phone: formData.phone,
        collegeId: formData.collegeId ? formData.collegeId.trim() : undefined,
      });

      if (res.success) {
        toast.success(
          res.isNewUser ? 'Student registered successfully!' : 'Signed in with Google',
          'Welcome to your PlaceCloud dashboard.'
        );
        navigate('/dashboard');
      } else {
        setError(res.message || 'Google registration failed.');
      }
    } catch (err) {
      setError(
        err.message ||
          err.response?.data?.message ||
          'Google registration failed. Please check your network and configuration.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    const numCgpa = parseFloat(formData.cgpa);
    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      setError('CGPA must be a valid number between 0.00 and 10.00.');
      return;
    }

    setLoading(true);

    try {
      const selectedCollege =
        formData.collegeName === 'OTHER'
          ? (formData.customCollegeName || '').trim()
          : formData.collegeName;

      if (!selectedCollege) {
        setError('Please select or specify your college or university name.');
        return;
      }

      const payload = {
        ...formData,
        collegeName: selectedCollege,
        cgpa: numCgpa,
        graduationYear: Number(formData.graduationYear),
        activeBacklogs: Number(formData.activeBacklogs),
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      const res = await registerStudent(payload);
      if (res.success) {
        toast.success('Registration successful!', 'Welcome to your student placement portal.');
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const cgpaValue = parseFloat(formData.cgpa);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(99, 102, 241, 0.14), rgba(14, 165, 233, 0.08), transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(55px)',
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

          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '3rem 1.25rem 4rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
                fontSize: '1.75rem',
                fontWeight: 'var(--font-weight-extrabold)',
                color: 'var(--text-primary)',
                marginTop: '1.25rem',
                letterSpacing: '-0.025em',
              }}
            >
              Student Intake & Placement Onboarding
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: '0.35rem' }}>
              Create your verified student profile to unlock automated eligibility checks and campus drives
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: '2.75rem', boxShadow: 'var(--shadow-xl)' }}>
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
                  marginBottom: '1.75rem',
                }}
                role="alert"
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Fast-Track with Google */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                    Fast-Track Student Onboarding
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--primary)',
                    fontWeight: 'var(--font-weight-semibold)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  ⚡ One-Click Auth
                </span>
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Already have a Google account? Sign up or sign in instantly without remembering a separate password.
              </p>

              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={googleLoading || loading}
                id="firebase-google-register-btn"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-xs)',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {googleLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite', color: 'var(--primary)' }} />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue & Register with Google</span>
                  </>
                )}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '0 0 1.75rem 0',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ padding: '0 0.85rem' }}>or fill in registration details</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Section 1: Personal Identification */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-default)' }}>
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                    1. Personal Information
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="e.g. Aarav"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="e.g. Singhania"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Institutional Email <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="student@college.edu"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Contact Phone <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Credentials */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-default)' }}>
                  <GraduationCap size={18} style={{ color: 'var(--success)' }} />
                  <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                    2. Academic Records & Eligibility
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      College / University Institution <span className="required">*</span>
                    </label>
                    <select
                      name="collegeName"
                      required
                      value={formData.collegeName}
                      onChange={handleChange}
                    >
                      {CURATED_COLLEGES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="OTHER">+ Other (Enter Custom College Name)</option>
                    </select>

                    {formData.collegeName === 'OTHER' && (
                      <input
                        type="text"
                        name="customCollegeName"
                        required
                        placeholder="Enter full college or university name"
                        value={formData.customCollegeName}
                        onChange={handleChange}
                        style={{ marginTop: '0.65rem' }}
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      College ID / Roll Number <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="collegeId"
                      required
                      placeholder="e.g. 2022BCS045"
                      value={formData.collegeId}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Academic Department <span className="required">*</span>
                    </label>
                    <select
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="Computer Science">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Graduation Batch Year <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      name="graduationYear"
                      required
                      min="2024"
                      max="2030"
                      value={formData.graduationYear}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        Current CGPA (0.00 - 10.00) <span className="required">*</span>
                      </label>
                      {!isNaN(cgpaValue) && cgpaValue > 0 && (
                        <span className={`badge ${cgpaValue >= 8.5 ? 'badge-success' : cgpaValue >= 7.0 ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                          {cgpaValue >= 8.5 ? 'Dream Tier Eligible' : cgpaValue >= 7.0 ? 'Core Eligible' : 'Standard Eligible'}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      name="cgpa"
                      required
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 8.75"
                      value={formData.cgpa}
                      onChange={handleChange}
                      style={{ marginTop: '0.35rem' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Standing Active Backlogs
                    </label>
                    <input
                      type="number"
                      name="activeBacklogs"
                      min="0"
                      max="20"
                      value={formData.activeBacklogs}
                      onChange={handleChange}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Must be 0 for most tier-1 placement drives.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Key Technical Skills (Comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      placeholder="e.g. React, Python, Node.js, AWS, SQL"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Account Credentials */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-default)' }}>
                  <Lock size={18} style={{ color: 'var(--warning)' }} />
                  <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                    3. Security Credentials
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Confirm Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.9rem', fontSize: 'var(--text-md)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 0.9s linear infinite' }} /> Creating Verified Student Profile...
                    </>
                  ) : (
                    <>
                      Complete Intake & Enter Portal <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
              Sign in to your account →
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Protected by Automated Academic Verification & PlaceCloud Cloud Architecture
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterStudentPage;
