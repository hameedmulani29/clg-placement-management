import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import EligibilityBadge from '../components/EligibilityBadge';
import PageHeader from '../components/PageHeader';
import { SkeletonStatGrid, SkeletonCard } from '../components/LoadingSpinner';
import { formatLPA, formatDate } from '../utils/formatters';
import {
  Briefcase,
  FileCheck2,
  Calendar,
  Award,
  ArrowRight,
  AlertTriangle,
  FileUp,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Search,
  Filter,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [collegeRecords, setCollegeRecords] = useState(null);
  const [recordsSearch, setRecordsSearch] = useState('');
  const [recordsDeptFilter, setRecordsDeptFilter] = useState('all');
  const [recordsRefreshing, setRecordsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Real-time polling for latest college placement records (every 15 seconds)
    const interval = setInterval(() => {
      fetchCollegeRecordsOnly();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchCollegeRecordsOnly = async () => {
    try {
      const recordsRes = await api.get('/results/college-records');
      if (recordsRes.data.success) {
        setCollegeRecords(recordsRes.data.data);
      }
    } catch (_) {}
  };

  const handleManualRefreshRecords = async () => {
    setRecordsRefreshing(true);
    await fetchCollegeRecordsOnly();
    setTimeout(() => setRecordsRefreshing(false), 400);
  };

  const fetchDashboardData = async () => {
    try {
      const [drivesRes, appsRes, interRes, recordsRes] = await Promise.all([
        api.get('/drives?limit=6'),
        api.get('/applications/my-applications'),
        api.get('/interviews/my-schedule'),
        api.get('/results/college-records'),
      ]);

      if (drivesRes.data.success) {
        setDrives(drivesRes.data.data || []);
      }
      if (appsRes.data.success) {
        setApplications(appsRes.data.data || []);
      }
      if (interRes.data.success) {
        setInterviews(interRes.data.data || []);
      }
      if (recordsRes.data.success) {
        setCollegeRecords(recordsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton" style={{ width: '40%', height: '2rem', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ width: '60%', height: '1rem' }} />
        </div>
        <SkeletonStatGrid count={4} />
        <div className="grid-cols-2">
          <SkeletonCard height="320px" />
          <SkeletonCard height="320px" />
        </div>
      </div>
    );
  }

  const appliedCount = applications.length;
  const interviewCount = applications.filter((a) => a.status === 'interview_scheduled').length;
  const selectedCount = applications.filter((a) => a.status === 'selected').length;
  const upcomingInterview = interviews.find((i) => new Date(i.scheduledDate) >= new Date());

  const displayedRecords = (collegeRecords?.records || []).filter((r) => {
    const student = r.studentId || {};
    const drive = r.placementDriveId || {};
    const company = r.companyId || {};

    const q = recordsSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(q) ||
      (student.collegeId || '').toLowerCase().includes(q) ||
      (company.name || '').toLowerCase().includes(q) ||
      (drive.jobRole || '').toLowerCase().includes(q);

    const matchesDept =
      recordsDeptFilter === 'all' ||
      (student.department || '').toLowerCase() === recordsDeptFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  const latestOffer = collegeRecords?.records && collegeRecords.records.length > 0 ? collegeRecords.records[0] : null;

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={`Welcome back, ${profile?.firstName || 'Student'}! 👋`}
        subtitle={`${collegeRecords?.collegeName || profile?.collegeName || user?.collegeName || 'COEP Technological University'} • ${profile?.department || 'Department'} • Roll No: ${profile?.collegeId || 'N/A'} • Verified CGPA: ${profile?.cgpa || '0.00'}`}
        badge={
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--success)',
              backgroundColor: 'var(--success-light)',
              padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--success-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <CheckCircle2 size={12} /> Active Candidate
          </span>
        }
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Link to="/drives" className="btn btn-primary btn-sm">
              <Briefcase size={15} /> Explore Drives
            </Link>
            <Link to="/profile" className="btn btn-secondary btn-sm">
              <FileUp size={15} /> Resume Vault
            </Link>
          </div>
        }
      />

      {/* Missing Resume Warning Banner */}
      {!profile?.resumeS3Key && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.15rem 1.35rem',
            backgroundColor: 'var(--warning-light)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--warning-text)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}>
                Resume missing from AWS S3 Cloud Vault
              </div>
              <div style={{ fontSize: 'var(--text-xs)', marginTop: '0.15rem', opacity: 0.9 }}>
                Recruiters cannot review your candidacy until you upload a validated PDF resume document.
              </div>
            </div>
          </div>
          <Link to="/profile" className="btn btn-warning btn-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            <FileUp size={15} /> Upload Resume Now
          </Link>
        </div>
      )}

      {/* Upcoming Interview Priority Card */}
      {upcomingInterview && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.15rem 1.35rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                Upcoming Interview Call • Round {upcomingInterview.roundNumber}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {upcomingInterview.placementDriveId?.companyId?.name} — {upcomingInterview.roundName}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {new Date(upcomingInterview.scheduledDate).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          <a
            href={upcomingInterview.locationOrMeetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Launch Virtual Meeting <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Real-time Campus Offer Ticker */}
      {latestOffer && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 0 3px var(--success-light)',
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', minWidth: 0 }}>
              <strong style={{ color: 'var(--success)' }}>⚡ LIVE CAMPUS SELECTION:</strong>{' '}
              <span>{latestOffer.studentId?.firstName} {latestOffer.studentId?.lastName}</span> ({latestOffer.studentId?.department}) received an offer from{' '}
              <strong>{latestOffer.companyId?.name}</strong> for <strong>{latestOffer.placementDriveId?.jobRole || latestOffer.designation}</strong> at{' '}
              <strong style={{ color: 'var(--success)' }}>{formatLPA(latestOffer.offeredSalary)}</strong>!
            </div>
          </div>
          <a href="#college-placement-records" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textDecoration: 'none' }}>
            View College Placement Records ↓
          </a>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Active Drives"
          value={drives.length}
          subtitle="Open on campus"
          icon={Briefcase}
          color="var(--primary)"
          bgColor="var(--primary-light)"
        />
        <StatCard
          title="Applied"
          value={appliedCount}
          subtitle="Drives submitted"
          icon={FileCheck2}
          color="var(--info)"
          bgColor="var(--info-light)"
        />
        <StatCard
          title="Interviews"
          value={interviewCount}
          subtitle="Active selection rounds"
          icon={Calendar}
          color="var(--warning)"
          bgColor="var(--warning-light)"
        />
        <StatCard
          title="Offers Won"
          value={selectedCount}
          subtitle="Confirmed selections"
          icon={Award}
          color="var(--success)"
          bgColor="var(--success-light)"
        />
      </div>

      {/* Main Content Columns */}
      <div className="grid-cols-2" style={{ alignItems: 'flex-start', gap: '1.75rem' }}>
        {/* Open Recruitment Drives */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                Open Placement Opportunities
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Drives currently accepting student applications
              </p>
            </div>
            <Link
              to="/drives"
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Browse all <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {drives.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '2rem 1rem' }}>
                No active placement drives currently scheduled.
              </p>
            ) : (
              drives.slice(0, 4).map((drive) => {
                const ctcFormatted = formatLPA(drive.salaryPackage?.ctc);
                return (
                  <div
                    key={drive._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.15rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      transition: 'border-color var(--duration-fast)',
                    }}
                  >
                    <div style={{ minWidth: 0, paddingRight: '0.75rem' }}>
                      <div
                        style={{
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--text-sm)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {drive.jobRole}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: '0.2rem' }}>
                        {drive.companyId?.name} • <strong style={{ color: 'var(--success)' }}>{ctcFormatted}</strong>
                      </div>
                      <div style={{ marginTop: '0.45rem' }}>
                        {drive.eligibility && (
                          <EligibilityBadge
                            isEligible={drive.eligibility.isEligible}
                            reasons={drive.eligibility.reasons}
                          />
                        )}
                      </div>
                    </div>

                    <Link to={`/drives/${drive._id}`} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                      Details
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Applications Progression */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                Application Pipeline Progress
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Latest round updates and recruiter decisions
              </p>
            </div>
            <Link
              to="/applications"
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Full history <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  You have not applied to any recruitment drives yet.
                </p>
                <Link to="/drives" className="btn btn-primary btn-sm" style={{ marginTop: '0.85rem' }}>
                  Explore Eligible Drives
                </Link>
              </div>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div
                  key={app._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.15rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: '0.75rem' }}>
                    <div
                      style={{
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-sm)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {app.placementDriveId?.jobRole || 'Campus Placement Drive'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: '0.2rem' }}>
                      {app.placementDriveId?.companyId?.name || 'Company'} • Current Round {app.currentRound}
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* College Placement Records & Live Selected Candidates Section */}
      <div id="college-placement-records" className="card" style={{ marginTop: '2.5rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.65rem', backgroundColor: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-full)', marginBottom: '0.45rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--success)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--success)', textTransform: 'uppercase' }}>
                Verified Institutional Stream
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)' }}>
              {collegeRecords?.collegeName || profile?.collegeName || 'Institutional'} Placement Records
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Real-time placement results, confirmed student offers, and hiring velocity for your college
            </p>
          </div>

          <button
            type="button"
            onClick={handleManualRefreshRecords}
            disabled={recordsRefreshing}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={recordsRefreshing ? 'spin' : ''} />
            {recordsRefreshing ? 'Syncing...' : 'Sync Live Data'}
          </button>
        </div>

        {/* 4 College Stats Highlights */}
        <div className="grid-cols-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
              Total Students Placed
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--success)', marginTop: '0.2rem' }}>
              {collegeRecords?.totalPlaced || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              From your college
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
              Highest Package
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--primary)', marginTop: '0.2rem' }}>
              {collegeRecords?.highestSalary ? formatLPA(collegeRecords.highestSalary) : '0.0 LPA'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Top verified offer
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
              Average Package
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--info)', marginTop: '0.2rem' }}>
              {collegeRecords?.averageSalary ? formatLPA(collegeRecords.averageSalary) : '0.0 LPA'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Campus cohort average
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
              Placement Rate
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {collegeRecords?.placementRate || 0}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Enrolled candidates
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <input
              type="text"
              placeholder="Search candidate, role, or company..."
              value={recordsSearch}
              onChange={(e) => setRecordsSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-xs)' }}
              aria-label="Search placed student records"
            />
            <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={recordsDeptFilter}
              onChange={(e) => setRecordsDeptFilter(e.target.value)}
              style={{ fontSize: 'var(--text-xs)', padding: '0.4rem 2rem 0.4rem 0.75rem', width: 'auto' }}
              aria-label="Filter records by academic department"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        {displayedRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
            No placement records match your active search or filter.
          </div>
        ) : (
          <div className="table-container">
            <table aria-label="College placement selected students table">
              <thead>
                <tr>
                  <th scope="col">Candidate</th>
                  <th scope="col">Roll ID</th>
                  <th scope="col">Department</th>
                  <th scope="col">Hiring Company</th>
                  <th scope="col">Job Role</th>
                  <th scope="col">Annual CTC</th>
                  <th scope="col">Offer Status</th>
                  <th scope="col">Selection Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedRecords.map((r) => {
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
                          {company.name || 'Partner Company'}
                        </div>
                      </td>
                      <td>{drive.jobRole || r.designation}</td>
                      <td>
                        <strong style={{ color: 'var(--success)' }}>
                          {formatLPA(r.offeredSalary)}
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-selected" style={{ textTransform: 'capitalize' }}>
                          {r.status || 'Selected'}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {formatDate(r.selectionDate)}
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

export default StudentDashboard;
