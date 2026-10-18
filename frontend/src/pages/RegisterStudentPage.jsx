import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterStudentPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeId: '',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: '',
    activeBacklogs: 0,
    phone: '',
    skills: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10) {
      setError('CGPA must be a valid number between 0.00 and 10.00.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        cgpa: Number(formData.cgpa),
        graduationYear: Number(formData.graduationYear),
        activeBacklogs: Number(formData.activeBacklogs),
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      const res = await registerStudent(payload);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '1.4rem' }}>
            <div style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <Cloud size={22} />
            </div>
            <span>PlaceCloud</span>
          </Link>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b', marginTop: '0.75rem' }}>Student Profile Registration</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create your placement credentials to browse and apply for drives</p>
        </div>

        <div className="card" style={{ padding: '2.5rem' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-cols-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>First Name *</label>
                <input type="text" name="firstName" required placeholder="Arjun" value={formData.firstName} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Last Name *</label>
                <input type="text" name="lastName" required placeholder="Sharma" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>

            <div className="grid-cols-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>College ID / Roll Number *</label>
                <input type="text" name="collegeId" required placeholder="2023CS0101" value={formData.collegeId} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Primary Phone Number *</label>
                <input type="tel" name="phone" required placeholder="9876543210" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>College Email Address *</label>
              <input type="email" name="email" required placeholder="arjun.sharma@college.edu" value={formData.email} onChange={handleChange} />
            </div>

            <div className="grid-cols-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Department / Branch *</label>
                <select name="department" value={formData.department} onChange={handleChange}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Graduation Pass-Out Year *</label>
                <select name="graduationYear" value={formData.graduationYear} onChange={handleChange}>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            <div className="grid-cols-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Current Cumulative CGPA (0.00 - 10.00) *</label>
                <input type="number" step="0.01" min="0" max="10" name="cgpa" required placeholder="8.75" value={formData.cgpa} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Active Standing Backlogs Count *</label>
                <input type="number" min="0" name="activeBacklogs" required value={formData.activeBacklogs} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Technical Skills (Comma Separated)</label>
              <input type="text" name="skills" placeholder="React, Node.js, AWS, Python, Docker" value={formData.skills} onChange={handleChange} />
            </div>

            <div className="grid-cols-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Password *</label>
                <input type="password" name="password" required minLength="6" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Confirm Password *</label>
                <input type="password" name="confirmPassword" required minLength="6" placeholder="Re-type password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
              {loading ? 'Creating Profile...' : 'Complete Registration & Open Dashboard'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: '#4f46e5' }}>
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudentPage;
