import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.role === 'admin') navigate('/admin');
        else if (res.role === 'recruiter') navigate('/recruiter');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '1.5rem', textDecoration: 'none' }}>
            <div style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
              <Cloud size={24} />
            </div>
            <span>PlaceCloud</span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginTop: '1rem' }}>Sign in to your account</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>Select your role or enter credentials to proceed</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Institutional / Corporate Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@college.edu or name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem' }}>
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', textAlign: 'center' }}>
              ⚡ 1-Click Evaluation Credentials
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickLogin('arjun.sharma@college.edu', 'StudentPassword123!')}
                style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
              >
                <CheckCircle2 size={15} color="#10b981" />
                <strong>Student:</strong> Arjun Sharma (CS, 9.35 CGPA)
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickLogin('admin@college.edu', 'AdminPassword123!')}
                style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
              >
                <CheckCircle2 size={15} color="#6366f1" />
                <strong>Admin:</strong> Placement Officer (TPO Cell)
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickLogin('recruiter.google@google.com', 'RecruiterPassword123!')}
                style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
              >
                <CheckCircle2 size={15} color="#0284c7" />
                <strong>Recruiter:</strong> Google Cloud Platform
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#64748b' }}>
          Are you a new student?{' '}
          <Link to="/register-student" style={{ fontWeight: 600, color: '#4f46e5' }}>
            Create student profile →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
