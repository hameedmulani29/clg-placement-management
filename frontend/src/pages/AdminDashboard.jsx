import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import { SkeletonStatGrid, SkeletonCard, SkeletonTable } from '../components/LoadingSpinner';
import { formatLPA, formatDate } from '../utils/formatters';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  Award,
  TrendingUp,
  Download,
  Plus,
  ArrowRight,
  DollarSign,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [collegeRecords, setCollegeRecords] = useState(null);
  const [selectedSearch, setSelectedSearch] = useState('');
  const [recordsRefreshing, setRecordsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard();

    // Real-time polling for latest confirmed candidate offers (every 15 seconds)
    const interval = setInterval(() => {
      fetchCollegeRecordsOnly();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchCollegeRecordsOnly = async () => {
    try {
      const res = await api.get('/results/college-records');
      if (res.data.success) {
        setCollegeRecords(res.data.data);
      }
    } catch (_) {}
  };

  const handleManualRefresh = async () => {
    setRecordsRefreshing(true);
    await fetchCollegeRecordsOnly();
    setTimeout(() => setRecordsRefreshing(false), 400);
  };

  const fetchAdminDashboard = async () => {
    try {
      const [sumRes, appsRes, recordsRes] = await Promise.all([
        api.get('/analytics/admin-summary'),
        api.get('/applications?limit=8'),
        api.get('/results/college-records'),
      ]);

      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
      if (appsRes.data.success) {
        setRecentApplications(appsRes.data.data || []);
      }
      if (recordsRes.data.success) {
        setCollegeRecords(recordsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const cleanBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    const baseUrl = cleanBase ? `${cleanBase}/api/v1` : '/api/v1';
    window.open(`${baseUrl}/reports/export-csv?token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton" style={{ width: '45%', height: '2rem', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ width: '65%', height: '1rem' }} />
        </div>
        <SkeletonStatGrid count={4} />
        <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
          <SkeletonCard height="180px" />
          <SkeletonCard height="180px" />
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  const avgSalaryFormatted = summary?.salaryStatistics?.averageSalary
    ? formatLPA(summary.salaryStatistics.averageSalary)
    : '0.0 LPA';
  const maxSalaryFormatted = summary?.salaryStatistics?.highestSalary
    ? formatLPA(summary.salaryStatistics.highestSalary)
    : '0.0 LPA';

  const placementPct = summary?.placementRate || 0;

  return (
    <div>
      {/* Page Header with Actions */}
      <PageHeader
        title="Placement Officer Command Center"
        subtitle="Institutional placement velocity, drive health analytics, and candidate selection operations"
        badge={
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-accent-600)',
              backgroundColor: 'var(--color-accent-50)',
              padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Shield size={12} /> Institutional Administration
          </span>
        }
        actions={
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Export complete placement cohort data to CSV"
            >
              <Download size={15} /> Export Placement CSV
            </button>
            <Link
              to="/admin/drives"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} /> Create Placement Drive
            </Link>
          </div>
        }
      />

      {/* KPI Highlights Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Registered Students"
          value={summary?.totalStudents || 0}
          subtitle="Verified candidate cohort"
          icon={Users}
          color="var(--primary)"
          bgColor="var(--primary-light)"
        />
        <StatCard
          title="Placement Drives"
          value={summary?.totalDrives || 0}
          subtitle={`${summary?.activeDrivesCount || 0} currently active`}
          icon={Briefcase}
          color="var(--info)"
          bgColor="var(--info-light)"
        />
        <StatCard
          title="Partner Companies"
          value={summary?.totalCompanies || 0}
          subtitle="Active corporate recruiters"
          icon={Building2}
          color="var(--color-accent-600)"
          bgColor="var(--color-accent-50)"
        />
        <StatCard
          title="Students Placed"
          value={summary?.totalSelectedStudents || 0}
          subtitle={`${placementPct}% institutional rate`}
          icon={Award}
          color="var(--success)"
          bgColor="var(--success-light)"
          trend={{ label: `${placementPct}%`, positive: true }}
        />
      </div>

      {/* Placement Rate Health & CTC Benchmarks */}
      <div className="grid-cols-2" style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
        {/* Placement Rate Metric Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Institutional Placement Cohort Velocity
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', margin: '0.5rem 0' }}>
              <span
                style={{
                  fontSize: '2.75rem',
                  fontFamily: 'var(--font-family-display)',
                  fontWeight: 'var(--font-weight-extrabold)',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {placementPct}%
              </span>
              <span
                style={{
                  color: 'var(--success)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <TrendingUp size={16} /> Verified Placement Rate
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
              Calculated dynamically over unique verified student candidates ({summary?.totalSelectedStudents || 0} placed out of {summary?.totalStudents || 0} registered).
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div
              style={{
                height: '10px',
                backgroundColor: 'var(--border-default)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(placementPct, 100)}%`,
                  backgroundColor: 'var(--success)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.8s var(--ease-out)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Salary Package Benchmarks Card */}
        <div className="card">
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
            Salary Remuneration Benchmarks (Annual CTC)
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div
              style={{
                padding: '1.1rem',
                backgroundColor: 'var(--success-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--success-border)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--success-text)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                HIGHEST PACKAGE (LPA)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--success-text)', marginTop: '0.2rem' }}>
                {maxSalaryFormatted}
              </div>
            </div>

            <div
              style={{
                padding: '1.1rem',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                AVERAGE PACKAGE (LPA)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--primary)', marginTop: '0.2rem' }}>
                {avgSalaryFormatted}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
            <Link
              to="/admin/analytics"
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View Accreditation Charts & Trends <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
              Recent Candidate Applications Stream
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Real-time feed of latest student submissions across all departmental drives
            </p>
          </div>
          <Link
            to="/admin/drives"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            Manage all drives <ArrowRight size={13} />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 1rem', fontSize: 'var(--text-sm)' }}>
            No candidate applications submitted yet.
          </p>
        ) : (
          <div className="table-container">
            <table aria-label="Recent student candidate applications table">
              <thead>
                <tr>
                  <th scope="col">Student Candidate</th>
                  <th scope="col">Roll ID</th>
                  <th scope="col">Branch</th>
                  <th scope="col">CGPA</th>
                  <th scope="col">Applied Drive</th>
                  <th scope="col">Company Partner</th>
                  <th scope="col">Current Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => {
                  const student = app.studentId || {};
                  const drive = app.placementDriveId || {};
                  const company = drive.companyId || {};
                  return (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' }}>
                        {student.collegeId}
                      </td>
                      <td>{student.department}</td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>{student.cgpa}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{drive.jobRole}</div>
                      </td>
                      <td>{company.name}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-time Selected Candidates Stream (College Level) */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--success)',
                  boxShadow: '0 0 0 3px var(--success-light)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success)', textTransform: 'uppercase' }}>
                Live Stream • {collegeRecords?.collegeName || 'COEP Technological University'}
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
              Real-Time Selected Candidates & Confirmed Offers
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Live stream of verified student offers ({collegeRecords?.records?.length || 0} placed candidates)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                placeholder="Search selected student..."
                value={selectedSearch}
                onChange={(e) => setSelectedSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem', fontSize: 'var(--text-xs)', paddingRight: '0.6rem' }}
                aria-label="Search selected candidates"
              />
              <Search size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={recordsRefreshing}
              className="btn btn-secondary btn-xs"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={13} className={recordsRefreshing ? 'spin' : ''} />
              {recordsRefreshing ? 'Syncing...' : 'Sync Live Offers'}
            </button>
          </div>
        </div>

        {(!collegeRecords?.records || collegeRecords.records.length === 0) ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 1rem', fontSize: 'var(--text-sm)' }}>
            No confirmed student placements recorded for this college yet.
          </p>
        ) : (
          <div className="table-container">
            <table aria-label="Real-time placed students table">
              <thead>
                <tr>
                  <th scope="col">Student Candidate</th>
                  <th scope="col">Roll ID</th>
                  <th scope="col">Department</th>
                  <th scope="col">Hiring Company</th>
                  <th scope="col">Position / Role</th>
                  <th scope="col">Remuneration Package</th>
                  <th scope="col">Selection Date</th>
                  <th scope="col">Offer Status</th>
                </tr>
              </thead>
              <tbody>
                {collegeRecords.records
                  .filter((r) => {
                    const student = r.studentId || {};
                    const drive = r.placementDriveId || {};
                    const company = r.companyId || {};
                    const q = selectedSearch.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(q) ||
                      (student.collegeId || '').toLowerCase().includes(q) ||
                      (company.name || '').toLowerCase().includes(q) ||
                      (drive.jobRole || '').toLowerCase().includes(q)
                    );
                  })
                  .map((r) => {
                    const student = r.studentId || {};
                    const drive = r.placementDriveId || {};
                    const company = r.companyId || {};
                    return (
                      <tr key={r._id}>
                        <td>
                          <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' }}>
                          {student.collegeId || 'N/A'}
                        </td>
                        <td>{student.department}</td>
                        <td>
                          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary)' }}>
                            {company.name}
                          </div>
                        </td>
                        <td>{drive.jobRole || r.designation}</td>
                        <td>
                          <strong style={{ color: 'var(--success)' }}>
                            {formatLPA(r.offeredSalary)}
                          </strong>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {formatDate(r.selectionDate)}
                        </td>
                        <td>
                          <span className="badge badge-selected" style={{ textTransform: 'capitalize' }}>
                            {r.status || 'Selected'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
