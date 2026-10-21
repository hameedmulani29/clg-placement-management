import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Tabs from '../components/Tabs';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { formatLPA, formatDate } from '../utils/formatters';
import { CURATED_COLLEGES, DEFAULT_COLLEGE } from '../utils/colleges';
import {
  Plus,
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  Layers,
  MapPin,
  Calendar,
  Loader2,
  Trash2,
  GraduationCap,
  Sparkles,
  Bell,
  ShieldCheck,
  Info,
} from 'lucide-react';

const AdminDrivesPage = () => {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const debouncedSearch = useDebounce(search, 250);

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
    collegeSpecificCriteria: [],
  });

  // College-Specific Criteria Inspection Modal
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [selectedDriveForCriteria, setSelectedDriveForCriteria] = useState(null);

  // Eligible Students Inspection Modal
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [cohortData, setCohortData] = useState(null);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortTab, setCohortTab] = useState('eligible');
  const [selectedDriveTitle, setSelectedDriveTitle] = useState('');

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
      if (compRes.data.success) {
        setCompanies(compRes.data.data || []);
        // Pre-select company if recruiter
        if (user?.role === 'recruiter' && profile?.companyId?._id) {
          setFormData((prev) => ({ ...prev, companyId: profile.companyId._id }));
        }
      }
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
        toast.success('Drive status updated', `Drive status transitioned to "${newStatus.toUpperCase()}".`);
      }
    } catch (err) {
      toast.error('Update failed', err.response?.data?.message || 'Failed to update drive status.');
    }
  };

  const handleInspectCohort = async (drive) => {
    setSelectedDriveTitle(`${drive.companyId?.name} — ${drive.jobRole}`);
    setIsCohortModalOpen(true);
    setCohortLoading(true);
    setCohortTab('eligible');
    try {
      const res = await api.get(`/drives/${drive._id}/eligible-students`);
      if (res.data.success) {
        setCohortData(res.data.data);
      }
    } catch (err) {
      toast.error('Cohort evaluation failed', 'Could not evaluate student cohort.');
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

  const handleAddCollegeCriteria = () => {
    setFormData((prev) => ({
      ...prev,
      collegeSpecificCriteria: [
        ...prev.collegeSpecificCriteria,
        {
          collegeName: CURATED_COLLEGES[0] || 'COEP Technological University',
          minCgpa: '7.5',
          maxBacklogs: 0,
          performanceRecord: 'Consistent >= 7.5 CGPA with zero active backlogs',
          allowedDepartments: ['Computer Science', 'Information Technology'],
          customPackage: '',
          notes: '',
        },
      ],
    }));
  };

  const handleRemoveCollegeCriteria = (index) => {
    setFormData((prev) => ({
      ...prev,
      collegeSpecificCriteria: prev.collegeSpecificCriteria.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateCollegeCriteria = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.collegeSpecificCriteria];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, collegeSpecificCriteria: updated };
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
      setFormError('Please select at least one eligible academic department.');
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
        collegeSpecificCriteria: (formData.collegeSpecificCriteria || []).map((crit) => ({
          collegeName: crit.collegeName,
          minCgpa: Number(crit.minCgpa),
          maxBacklogs: Number(crit.maxBacklogs),
          performanceRecord: crit.performanceRecord || '',
          allowedDepartments: crit.allowedDepartments || formData.allowedDepartments,
          customPackage: crit.customPackage || '',
          notes: crit.notes || '',
        })),
        applicationDeadline: formData.applicationDeadline,
        driveDate: formData.driveDate,
      };

      const res = await api.post('/drives', payload);
      if (res.data.success) {
        setIsCreateModalOpen(false);
        toast.success('Placement Drive Created!', `Drive "${formData.jobRole}" successfully scheduled on campus.`);
        await fetchDrivesAndCompanies();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create placement drive.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to safely extract college-specific criteria list
  const getCollegeCriteriaList = (drive) => {
    if (!drive?.collegeSpecificCriteria) return [];
    if (Array.isArray(drive.collegeSpecificCriteria)) return drive.collegeSpecificCriteria;
    try {
      const parsed = JSON.parse(drive.collegeSpecificCriteria);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  // Filter drives
  const filteredDrives = drives.filter((drive) => {
    const role = (drive.jobRole || '').toLowerCase();
    const compName = (drive.companyId?.name || '').toLowerCase();
    const matchesSearch =
      !debouncedSearch.trim() ||
      role.includes(debouncedSearch.toLowerCase()) ||
      compName.includes(debouncedSearch.toLowerCase());

    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDrives.length / pageSize) || 1;
  const paginatedDrives = filteredDrives.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusTabs = [
    { id: 'all', label: 'All Drives', count: drives.length },
    { id: 'ongoing', label: 'Ongoing', count: drives.filter((d) => d.status === 'ongoing').length },
    { id: 'upcoming', label: 'Upcoming', count: drives.filter((d) => d.status === 'upcoming').length },
    { id: 'completed', label: 'Completed', count: drives.filter((d) => d.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: drives.filter((d) => d.status === 'cancelled').length },
  ];

  return (
    <div>
      <PageHeader
        title={user?.role === 'recruiter' ? 'Company Placement Drives' : 'Placement Drives Lifecycle & Cohort Inspector'}
        subtitle="Manage recruitment drives, review eligibility criteria, and pre-screen student cohort pools"
        breadcrumbs={[
          { label: user?.role === 'recruiter' ? 'Recruiter' : 'Admin' },
          { label: 'Placement Drives' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={15} /> New Placement Drive
          </button>
        }
      />

      {/* Discovery & Status Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Tabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onChange={(tabId) => {
              setStatusFilter(tabId);
              setCurrentPage(1);
            }}
            size="sm"
          />

          <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
            <input
              type="text"
              placeholder="Search drives by role or company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-xs)' }}
              aria-label="Search placement drives"
            />
            <Search
              size={15}
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
      </div>

      {/* Drives Management Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={search || statusFilter !== 'all' ? 'No Matching Drives Found' : 'No Placement Drives Scheduled'}
          description={
            search || statusFilter !== 'all'
              ? 'No placement drives match your active search and status filter.'
              : 'There are currently no placement drives created in the system.'
          }
          actionText="Create New Drive"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table aria-label="Placement drives administration table">
            <thead>
              <tr>
                <th scope="col">Company Partner</th>
                <th scope="col">Job Role</th>
                <th scope="col">Package (CTC)</th>
                <th scope="col">Eligibility Rules</th>
                <th scope="col">Application Deadline</th>
                <th scope="col">Drive Status</th>
                <th scope="col">Cohort Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrives.map((drive) => {
                const ctcFormatted = formatLPA(drive.salaryPackage?.ctc);
                const isDeadlinePassed = new Date(drive.applicationDeadline) < new Date();

                return (
                  <tr key={drive._id}>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                        {drive.companyId?.name || 'Company Partner'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {drive.companyId?.industry || 'Enterprise'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                        {drive.jobRole}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {drive.jobLocations?.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--success)' }}>{ctcFormatted}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)' }}>
                        <span>≥ {drive.eligibilityCriteria?.minCgpa ?? 'N/A'} CGPA</span> •{' '}
                        <span style={{ color: 'var(--text-muted)' }}>≤ {drive.eligibilityCriteria?.maxBacklogs ?? 0} backlogs</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Batch {drive.eligibilityCriteria?.graduationYear ?? 'N/A'}
                      </div>
                      {getCollegeCriteriaList(drive).length > 0 && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDriveForCriteria(drive);
                              setIsCriteriaModalOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.68rem',
                              fontWeight: 'var(--font-weight-bold)',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(37, 99, 235, 0.1)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(37, 99, 235, 0.25)',
                              cursor: 'pointer',
                            }}
                            title="View per-college criteria overrides and standards"
                          >
                            <GraduationCap size={11} />
                            {getCollegeCriteriaList(drive).length} College Override{getCollegeCriteriaList(drive).length > 1 ? 's' : ''}
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)', color: isDeadlinePassed ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {formatDate(drive.applicationDeadline)}
                      </div>
                    </td>
                    <td>
                      {user?.role === 'admin' ? (
                        <select
                          value={drive.status}
                          onChange={(e) => handleStatusChange(drive._id, e.target.value)}
                          style={{
                            padding: '0.3rem 1.8rem 0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: 'var(--font-weight-semibold)',
                            width: 'auto',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          aria-label={`Change status for ${drive.jobRole}`}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <StatusBadge status={drive.status} />
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleInspectCohort(drive)}
                          className="btn btn-secondary btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}
                          title="Run automated pre-screening inspector across all college students"
                        >
                          <Users size={13} /> Inspect Cohort
                        </button>
                        <Link
                          to={`/drives/${drive._id}`}
                          className="btn btn-ghost btn-xs"
                          title="View public student dossier"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredDrives.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Modal 1: Create Placement Drive Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New On-Campus Placement Drive"
        subtitle="Configure criteria, remuneration package, and selection stages"
        maxWidth="680px"
      >
        {formError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              fontSize: 'var(--text-xs)',
              marginBottom: '1.25rem',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateDrive} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label htmlFor="drv-company" className="form-label">
                Hiring Company Partner <span className="required">*</span>
              </label>
              <select
                id="drv-company"
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              >
                <option value="">Select Partner Company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.industry})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="drv-role" className="form-label">
                Job Role / Position <span className="required">*</span>
              </label>
              <input
                id="drv-role"
                type="text"
                required
                placeholder="e.g. Cloud Solutions Engineer"
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="drv-title" className="form-label">
              Drive Headline Title <span className="required">*</span>
            </label>
            <input
              id="drv-title"
              type="text"
              required
              placeholder="e.g. Google Cloud Campus Hiring Drive 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="drv-desc" className="form-label">
              Detailed Job Description <span className="required">*</span>
            </label>
            <textarea
              id="drv-desc"
              required
              rows={3}
              placeholder="Responsibilities, required technical skills, qualifications..."
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
            />
          </div>

          <div className="grid-cols-3">
            <div className="form-group">
              <label htmlFor="drv-ctc" className="form-label">
                Annual CTC (INR) <span className="required">*</span>
              </label>
              <input
                id="drv-ctc"
                type="number"
                required
                placeholder="e.g. 1800000"
                value={formData.ctc}
                onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="drv-base" className="form-label">
                Base Remuneration (INR)
              </label>
              <input
                id="drv-base"
                type="number"
                placeholder="e.g. 1500000"
                value={formData.base}
                onChange={(e) => setFormData({ ...formData, base: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="drv-locations" className="form-label">
                Job Locations
              </label>
              <input
                id="drv-locations"
                type="text"
                placeholder="Bangalore, Hyderabad"
                value={formData.jobLocations}
                onChange={(e) => setFormData({ ...formData, jobLocations: e.target.value })}
              />
            </div>
          </div>

          {/* Automated Eligibility Thresholds */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              Automated Eligibility Engine Rules
            </div>

            <div className="grid-cols-3" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="drv-min-cgpa" className="form-label">
                  Min. CGPA <span className="required">*</span>
                </label>
                <input
                  id="drv-min-cgpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="drv-grad-year" className="form-label">
                  Graduation Year <span className="required">*</span>
                </label>
                <select
                  id="drv-grad-year"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="drv-max-backlogs" className="form-label">
                  Max Standing Backlogs <span className="required">*</span>
                </label>
                <input
                  id="drv-max-backlogs"
                  type="number"
                  min="0"
                  required
                  value={formData.maxBacklogs}
                  onChange={(e) => setFormData({ ...formData, maxBacklogs: e.target.value })}
                />
              </div>
            </div>

            {/* Allowed Branches Checkboxes */}
            <div className="form-group">
              <span className="form-label">
                Allowed Academic Departments <span className="required">*</span>
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.4rem' }}>
                {[
                  'Computer Science',
                  'Information Technology',
                  'Electronics & Communication',
                  'Electrical Engineering',
                  'Mechanical Engineering',
                  'Civil Engineering',
                ].map((dept) => {
                  const isChecked = formData.allowedDepartments.includes(dept);
                  return (
                    <label
                      key={dept}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDepartmentCheckbox(dept)}
                        style={{ width: 'auto' }}
                      />
                      <span>{dept}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* College-Specific Criteria & TPO Notifications */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(37, 99, 235, 0.03)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <GraduationCap size={15} /> College-Specific Criteria & TPO Notifications
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Set custom CGPA, performance thresholds, and package rules for specific colleges. TPOs of selected colleges receive immediate notifications.
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddCollegeCriteria}
                className="btn btn-secondary btn-xs"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={13} /> Add College Override
              </button>
            </div>

            {formData.collegeSpecificCriteria.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No college-specific overrides configured. The general eligibility rules above will apply to all institutions.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {formData.collegeSpecificCriteria.map((crit, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                        College Override #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCollegeCriteria(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem' }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>

                    <div className="grid-cols-2" style={{ marginBottom: '0.6rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>
                          Target College Name <span className="required">*</span>
                        </label>
                        <select
                          value={crit.collegeName}
                          onChange={(e) => handleUpdateCollegeCriteria(idx, 'collegeName', e.target.value)}
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          {CURATED_COLLEGES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Min CGPA</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={crit.minCgpa}
                            onChange={(e) => handleUpdateCollegeCriteria(idx, 'minCgpa', e.target.value)}
                            style={{ fontSize: 'var(--text-xs)' }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Max Backlogs</label>
                          <input
                            type="number"
                            min="0"
                            value={crit.maxBacklogs}
                            onChange={(e) => handleUpdateCollegeCriteria(idx, 'maxBacklogs', e.target.value)}
                            style={{ fontSize: 'var(--text-xs)' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>
                        Student Performance Record Requirement
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Consistent >= 8.0 CGPA, 0 active backlogs, proven DSA / hackathon track record"
                        value={crit.performanceRecord || ''}
                        onChange={(e) => handleUpdateCollegeCriteria(idx, 'performanceRecord', e.target.value)}
                        style={{ fontSize: 'var(--text-xs)' }}
                      />
                    </div>

                    <div className="grid-cols-2" style={{ gap: '0.5rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>
                          Custom CTC Package (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 24 LPA (Premium tier for this campus)"
                          value={crit.customPackage || ''}
                          onChange={(e) => handleUpdateCollegeCriteria(idx, 'customPackage', e.target.value)}
                          style={{ fontSize: 'var(--text-xs)' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>
                          Campus Notes / Instructions
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Round 1 online test conducted in campus lab"
                          value={crit.notes || ''}
                          onChange={(e) => handleUpdateCollegeCriteria(idx, 'notes', e.target.value)}
                          style={{ fontSize: 'var(--text-xs)' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label htmlFor="drv-deadline" className="form-label">
                Application Deadline Date <span className="required">*</span>
              </label>
              <input
                id="drv-deadline"
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="drv-date" className="form-label">
                Drive Commencement Date <span className="required">*</span>
              </label>
              <input
                id="drv-date"
                type="date"
                required
                value={formData.driveDate}
                onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating Drive...' : 'Publish Placement Drive'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Cohort Pre-Screening Inspector Modal */}
      <Modal
        isOpen={isCohortModalOpen}
        onClose={() => setIsCohortModalOpen(false)}
        title="Student Cohort Eligibility Inspector"
        subtitle={selectedDriveTitle}
        maxWidth="760px"
      >
        {cohortLoading ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 0.9s linear infinite', color: 'var(--primary)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Executing automated criteria matching engine across all college students...
            </p>
          </div>
        ) : !cohortData ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No cohort evaluation data returned.
          </p>
        ) : (
          <div>
            {/* Inspector Summary Cards */}
            <div className="grid-cols-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--success-text)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                  ELIGIBLE CANDIDATES
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--success-text)', marginTop: '0.2rem' }}>
                  {cohortData.eligibleStudents?.length || 0}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--success-text)', opacity: 0.85 }}>
                  Ready to apply
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--danger-text)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                  INELIGIBLE CANDIDATES
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--danger-text)', marginTop: '0.2rem' }}>
                  {cohortData.ineligibleStudents?.length || 0}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-text)', opacity: 0.85 }}>
                  Disqualified by criteria
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                  TOTAL EVALUATED
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {(cohortData.eligibleStudents?.length || 0) + (cohortData.ineligibleStudents?.length || 0)}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Total registered college pool
                </div>
              </div>
            </div>

            {/* Tabs for Eligible vs Ineligible */}
            <div style={{ marginBottom: '1rem' }}>
              <Tabs
                tabs={[
                  { id: 'eligible', label: 'Eligible Students Pool', count: cohortData.eligibleStudents?.length || 0 },
                  { id: 'ineligible', label: 'Ineligible Students & Reasons', count: cohortData.ineligibleStudents?.length || 0 },
                ]}
                activeTab={cohortTab}
                onChange={(tabId) => setCohortTab(tabId)}
                size="sm"
              />
            </div>

            {/* Tab 1: Eligible Students Table */}
            {cohortTab === 'eligible' && (
              <div className="table-container" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Candidate Name</th>
                      <th scope="col">Roll ID</th>
                      <th scope="col">Department</th>
                      <th scope="col">CGPA</th>
                      <th scope="col">Backlogs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.eligibleStudents?.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No students in the college database currently meet all criteria for this drive.
                        </td>
                      </tr>
                    ) : (
                      cohortData.eligibleStudents.map((st) => (
                        <tr key={st._id}>
                          <td style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            {st.firstName} {st.lastName}
                          </td>
                          <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' }}>
                            {st.collegeId}
                          </td>
                          <td>{st.department}</td>
                          <td>
                            <strong style={{ color: 'var(--success)' }}>{st.cgpa}</strong>
                          </td>
                          <td>{st.activeBacklogs}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Ineligible Students Table with Reasons */}
            {cohortTab === 'ineligible' && (
              <div className="table-container" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Candidate</th>
                      <th scope="col">Roll ID</th>
                      <th scope="col">Department</th>
                      <th scope="col">CGPA</th>
                      <th scope="col">Disqualification Reasons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.ineligibleStudents?.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          All students in the college database qualify for this placement drive.
                        </td>
                      </tr>
                    ) : (
                      cohortData.ineligibleStudents.map((st) => (
                        <tr key={st._id}>
                          <td style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            {st.firstName} {st.lastName}
                          </td>
                          <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' }}>
                            {st.collegeId}
                          </td>
                          <td>{st.department}</td>
                          <td>
                            <strong>{st.cgpa}</strong>
                          </td>
                          <td>
                            <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.75rem', color: 'var(--danger-text)' }}>
                              {st.reasons?.map((r, idx) => (
                                <li key={idx}>{r}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal 3: College Specific Criteria Inspection Modal */}
      <Modal
        isOpen={isCriteriaModalOpen}
        onClose={() => {
          setIsCriteriaModalOpen(false);
          setSelectedDriveForCriteria(null);
        }}
        title="College-Specific Eligibility Criteria & Performance Standards"
        subtitle={selectedDriveForCriteria ? `${selectedDriveForCriteria.companyId?.name} — ${selectedDriveForCriteria.jobRole}` : ''}
        maxWidth="740px"
      >
        {selectedDriveForCriteria && (
          <div>
            {user?.role === 'admin' && profile?.collegeName && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Building2 size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                    Your College TPO Node: {profile.collegeName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    {getCollegeCriteriaList(selectedDriveForCriteria).some(
                      (c) => c.collegeName?.toLowerCase() === profile.collegeName?.toLowerCase()
                    )
                      ? 'This company has configured dedicated eligibility criteria tailored specifically for your institution!'
                      : 'This company uses default drive criteria for your college. Overrides are shown below for other partner campuses.'}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getCollegeCriteriaList(selectedDriveForCriteria).length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No college-specific overrides configured. This drive applies universal criteria across all campuses.
                </div>
              ) : (
                getCollegeCriteriaList(selectedDriveForCriteria).map((crit, idx) => {
                  const isCurrentTpoCollege =
                    user?.role === 'admin' &&
                    profile?.collegeName &&
                    crit.collegeName?.toLowerCase() === profile.collegeName?.toLowerCase();

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '1.15rem',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrentTpoCollege ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                        backgroundColor: isCurrentTpoCollege ? 'rgba(37, 99, 235, 0.03)' : 'var(--bg-surface)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                              {crit.collegeName}
                            </strong>
                            {isCurrentTpoCollege && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '999px',
                                  backgroundColor: 'var(--primary)',
                                  color: '#fff',
                                  fontWeight: 'var(--font-weight-bold)',
                                }}
                              >
                                Your Campus
                              </span>
                            )}
                          </div>
                          {crit.customPackage && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'var(--font-weight-semibold)', marginTop: '0.15rem' }}>
                              Campus CTC Package: {crit.customPackage}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ fontSize: 'var(--text-xs)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)' }}>
                            Min CGPA: <strong>{crit.minCgpa}</strong>
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)' }}>
                            Max Backlogs: <strong>{crit.maxBacklogs}</strong>
                          </span>
                        </div>
                      </div>

                      {crit.performanceRecord && (
                        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '0.65rem', fontSize: 'var(--text-xs)' }}>
                          <strong style={{ color: 'var(--text-secondary)' }}>Performance Standard: </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{crit.performanceRecord}</span>
                        </div>
                      )}

                      {crit.allowedDepartments && crit.allowedDepartments.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Eligible Depts:</span>
                          {crit.allowedDepartments.map((dept) => (
                            <span key={dept} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)' }}>
                              {dept}
                            </span>
                          ))}
                        </div>
                      )}

                      {crit.notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          <em>Note: {crit.notes}</em>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsCriteriaModalOpen(false);
                  setSelectedDriveForCriteria(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDrivesPage;
