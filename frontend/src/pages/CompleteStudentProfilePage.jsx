import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, GraduationCap, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CURATED_COLLEGES } from '../utils/colleges';

const DEPARTMENTS = [
  ['Computer Science', 'Computer Science & Engineering'],
  ['Information Technology', 'Information Technology'],
  ['Electronics & Communication', 'Electronics & Communication'],
  ['Electrical Engineering', 'Electrical Engineering'],
  ['Mechanical Engineering', 'Mechanical Engineering'],
  ['Civil Engineering', 'Civil Engineering'],
];

const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 10 }, (_, index) => currentYear - 2 + index);

const CompleteStudentProfilePage = () => {
  const { user, completeStudentProfile, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    collegeId: '',
    department: '',
    graduationYear: '',
    cgpa: '',
    activeBacklogs: '',
    phone: '',
    collegeName: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (Object.values(form).some((value) => !String(value).trim())) {
      setError('Complete each field before continuing.');
      return;
    }

    const cgpa = Number(form.cgpa);
    const graduationYear = Number(form.graduationYear);
    const activeBacklogs = Number(form.activeBacklogs);
    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
      setError('Enter a current GPA between 0 and 10.');
      return;
    }
    if (!Number.isInteger(activeBacklogs) || activeBacklogs < 0) {
      setError('Active backlogs must be zero or a positive whole number.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSaving(true);
    try {
      await completeStudentProfile({
        ...form,
        graduationYear,
        cgpa,
        activeBacklogs,
        phone: `+91${form.phone}`,
      });
      toast.success('Profile completed', 'Your student portal is ready.');
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%' };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.62)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-profile-title"
        className="card"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--primary)',
              backgroundColor: 'var(--primary-light)',
            }}
          >
            <GraduationCap size={23} />
          </div>
          <div>
            <h1 id="complete-profile-title" style={{ margin: 0, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              Complete your student profile
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Finish these details to unlock your dashboard.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-subtle)',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Google account name</div>
            <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{user?.displayName || 'Name not provided by Google'}</strong>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Verified email</div>
            <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', overflowWrap: 'anywhere' }}>{user?.email}</strong>
          </div>
        </div>

        <div
          role="status"
          style={{
            display: 'flex',
            gap: '0.6rem',
            padding: '0.75rem 0.9rem',
            marginBottom: '1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <ShieldCheck size={17} style={{ flexShrink: 0, color: 'var(--primary)' }} />
          <span>Your name and email come from your verified Google account. The dashboard behind this window stays locked until you save the remaining details.</span>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 0.9rem',
              marginBottom: '1rem',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              backgroundColor: 'var(--danger-light)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid-cols-2" style={{ gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="complete-roll-number">Roll number <span className="required">*</span></label>
              <input id="complete-roll-number" name="collegeId" value={form.collegeId} onChange={handleChange} autoComplete="off" required style={inputStyle} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complete-department">Department <span className="required">*</span></label>
              <select id="complete-department" name="department" value={form.department} onChange={handleChange} required style={inputStyle}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complete-graduation-year">Graduation year <span className="required">*</span></label>
              <select id="complete-graduation-year" name="graduationYear" value={form.graduationYear} onChange={handleChange} required style={inputStyle}>
                <option value="">Select year</option>
                {GRADUATION_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complete-cgpa">Current GPA (0–10) <span className="required">*</span></label>
              <input id="complete-cgpa" name="cgpa" type="number" min="0" max="10" step="0.01" value={form.cgpa} onChange={handleChange} required style={inputStyle} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complete-backlogs">Active backlogs <span className="required">*</span></label>
              <input id="complete-backlogs" name="activeBacklogs" type="number" min="0" step="1" value={form.activeBacklogs} onChange={handleChange} required style={inputStyle} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="complete-mobile">Mobile number <span className="required">*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span aria-hidden="true" style={{ padding: '0.7rem 0.75rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-subtle)' }}>+91</span>
                <input id="complete-mobile" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} pattern="[0-9]{10}" placeholder="10-digit number" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} required style={inputStyle} />
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="complete-college">College / university <span className="required">*</span></label>
              <select id="complete-college" name="collegeName" value={form.collegeName} onChange={handleChange} required style={inputStyle}>
                <option value="">Select college</option>
                {CURATED_COLLEGES.map((college) => <option key={college} value={college}>{college}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={logout}>Sign out</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={16} /> Saving profile...</> : 'Save profile and unlock dashboard'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CompleteStudentProfilePage;
