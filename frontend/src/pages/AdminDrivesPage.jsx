import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { Plus, Users, Briefcase, Building2, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';

const AdminDrivesPage = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Drive Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    companyId: '',
    jobRole: '',
    jobDescription: '',
    jobLocations: 'Bangalore, Hyderabad',
    ctc: '',
    base: '',
    minCgpa: '7.0',
    allowedDepartments: ['Computer Science', 'Information Technology'],
    graduationYear: 2026,
    maxBacklogs: 0,
    applicationDeadline: '',
    driveDate: '',
  });

  // Eligible Students Inspection Modal
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [cohortData, setCohortData] = useState(null);
  const [cohortLoading, setCohortLoading] = useState(false);

  useEffect(() => {
    fetchDrivesAndCompanies();
  }, []);

  const fetchDrivesAndCompanies = async () => {
    try {
      const [drivesRes, compRes] = await Promise.all([
        api.get('/drives'),
        api.get('/companies'),
      ]);

      if (drivesRes.data.success) setDrives(drivesRes.data.data || []);
      if (compRes.data.success) setCompanies(compRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (driveId, newStatus) => {
    try {
      const res = await api.patch(`/drives/${driveId}/status`, { status: newStatus });
      if (res.data.success) {
        setDrives((prev) =>
          prev.map((d) => (d._id === driveId ? { ...d, status: newStatus } : d))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleInspectCohort = async (driveId) => {
    setIsCohortModalOpen(true);
    setCohortLoading(true);
    try {
      const res = await api.get(`/drives/${driveId}/eligible-students`);
      if (res.data.success) {
        setCohortData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCohortLoading(false);
    }
  };

  const handleDepartmentCheckbox = (dept) => {
    setFormData((prev) => {
      const exists = prev.allowedDepartments.includes(dept);
      return {
        ...prev,
        allowedDepartments: exists
          ? prev.allowedDepartments.filter((d) => d !== dept)
          : [...prev.allowedDepartments, dept],
      };
    });
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.companyId) {
      setFormError('Please select a company partner.');
      return;
    }
    if (formData.allowedDepartments.length === 0) {
      setFormError('Please select at least one eligible department.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        companyId: formData.companyId,
        jobRole: formData.jobRole,
        jobDescription: formData.jobDescription,
        jobLocations: formData.jobLocations.split(',').map((s) => s.trim()),
        salaryPackage: {
          ctc: Number(formData.ctc),
          base: Number(formData.base) || Number(formData.ctc),
        },
        eligibilityCriteria: {
          minCgpa: Number(formData.minCgpa),
          allowedDepartments: formData.allowedDepartments,
          graduationYear: Number(formData.graduationYear),
          maxBacklogs: Number(formData.maxBacklogs),
        },
        applicationDeadline: formData.applicationDeadline,
        driveDate: formData.driveDate,
      };

      const res = await api.post('/drives', payload);
      if (res.data.success) {
        setIsCreateModalOpen(false);
        await fetchDrivesAndCompanies();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create placement drive.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading placement drives manager..." />;

  const allDepartments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Manage Placement Drives</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Configure job criteria, selection rounds, and inspect candidate eligibility</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={16} /> New Placement Drive
        </button>
      </div>

      {/* Drives Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Job Role & Title</th>
              <th>Company</th>
              <th>Package (CTC)</th>
              <th>Eligibility Rules</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drives.map((drive) => {
              const ctcLpa = drive.salaryPackage?.ctc ? (drive.salaryPackage.ctc / 100000).toFixed(2) : 'N/A';
              return (
                <tr key={drive._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{drive.jobRole}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{drive.title}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{drive.companyId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{drive.companyId?.industry}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{ctcLpa} LPA</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                      CGPA: ≥ <strong>{drive.eligibilityCriteria?.minCgpa}</strong> • Max Backlogs: {drive.eligibilityCriteria?.maxBacklogs}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {drive.eligibilityCriteria?.allowedDepartments?.join(', ')}
                    </div>
                  </td>
                  <td>{new Date(drive.applicationDeadline).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={drive.status}
                      onChange={(e) => handleStatusChange(drive._id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem', width: 'auto' }}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleInspectCohort(drive._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Users size={14} /> Inspect Candidates
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Drive Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Placement Drive" maxWidth="720px">
        {formError && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateDrive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Partner Company *</label>
            <select value={formData.companyId} onChange={(e) => setFormData({ ...formData, companyId: e.target.value })} required>
              <option value="">-- Choose Company --</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.name} ({c.industry})</option>
              ))}
            </select>
          </div>

          <div className="grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Job Role *</label>
              <input type="text" placeholder="Associate Cloud Engineer" required value={formData.jobRole} onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Drive Title *</label>
              <input type="text" placeholder="AWS Campus Drive 2026" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Job Description *</label>
            <textarea rows={3} required placeholder="Job responsibilities and skills required..." value={formData.jobDescription} onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })} />
          </div>

          <div className="grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Annual CTC (INR) *</label>
              <input type="number" required placeholder="1400000" value={formData.ctc} onChange={(e) => setFormData({ ...formData, ctc: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Base Salary (INR)</label>
              <input type="number" placeholder="1200000" value={formData.base} onChange={(e) => setFormData({ ...formData, base: e.target.value })} />
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Eligibility Thresholds</div>
            <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Min CGPA *</label>
                <input type="number" step="0.1" min="0" max="10" required value={formData.minCgpa} onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Max Backlogs *</label>
                <input type="number" min="0" required value={formData.maxBacklogs} onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Target Batch *</label>
                <input type="number" required value={formData.graduationYear} onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Allowed Departments *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {allDepartments.map((dept) => (
                  <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={formData.allowedDepartments.includes(dept)}
                      onChange={() => handleDepartmentCheckbox(dept)}
                      style={{ width: 'auto' }}
                    />
                    {dept}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Application Deadline *</label>
              <input type="date" required value={formData.applicationDeadline} onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Drive Execution Date *</label>
              <input type="date" required value={formData.driveDate} onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Creating Drive...' : 'Publish Placement Drive'}</button>
          </div>
        </form>
      </Modal>

      {/* Candidate Eligibility Cohort Inspection Modal */}
      <Modal isOpen={isCohortModalOpen} onClose={() => setIsCohortModalOpen(false)} title="Drive Candidate Eligibility Analysis" maxWidth="800px">
        {cohortLoading ? (
          <LoadingSpinner message="Running algorithmic eligibility check on student cohort..." />
        ) : !cohortData ? (
          <p>No cohort data available.</p>
        ) : (
          <div>
            <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TOTAL EVALUATED</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{cohortData.totalStudentsEvaluated}</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>ELIGIBLE CANDIDATES</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{cohortData.eligibleCount}</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>INELIGIBLE CANDIDATES</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>{cohortData.ineligibleCount}</div>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Eligible Students List</h3>
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Roll ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Backlogs</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.eligibleStudents.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.collegeId}</strong></td>
                      <td>{s.firstName} {s.lastName}</td>
                      <td>{s.department}</td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>{s.cgpa}</td>
                      <td>{s.activeBacklogs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDrivesPage;
