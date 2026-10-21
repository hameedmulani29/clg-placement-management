import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import { SkeletonCard } from '../components/LoadingSpinner';
import { formatLPA, formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  FileCheck2,
  Layers,
  Sparkles,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

const DriveDetailsPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetchDriveDetails();
  }, [id]);

  const fetchDriveDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/drives/${id}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load drive:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyError('');
    try {
      const res = await api.post('/applications', { placementDriveId: id });
      if (res.data.success) {
        toast.success(
          'Application Submitted!',
          `Your verified profile and cloud resume were forwarded to ${data?.drive?.companyId?.name}.`
        );
        await fetchDriveDetails();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Application submission failed.';
      setApplyError(msg);
      toast.error('Application Error', msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <SkeletonCard height="220px" />
        <div style={{ marginTop: '1.5rem' }}>
          <div className="grid-cols-2">
            <SkeletonCard height="280px" />
            <SkeletonCard height="280px" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.drive) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>Placement Drive Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: 'var(--text-sm)' }}>
          This placement drive record may have been deleted or archived by the placement office.
        </p>
        <Link to="/drives" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
          Back to Drives Catalog
        </Link>
      </div>
    );
  }

  const { drive, eligibility, userApplication } = data;
  const ctcFormatted = formatLPA(drive.salaryPackage?.ctc);
  const baseFormatted = formatLPA(drive.salaryPackage?.base);

  // Criteria checks for candidate breakdown
  const isCgpaMet = profile ? profile.cgpa >= drive.eligibilityCriteria.minCgpa : false;
  const isDeptMet = profile ? drive.eligibilityCriteria.allowedDepartments.includes(profile.department) : false;
  const isYearMet = profile ? profile.graduationYear === drive.eligibilityCriteria.graduationYear : false;
  const isBacklogMet = profile ? profile.activeBacklogs <= drive.eligibilityCriteria.maxBacklogs : false;
  const isDeadlineValid = new Date() <= new Date(drive.applicationDeadline);

  const canApply = user?.role === 'student' && eligibility?.isEligible && !userApplication && isDeadlineValid;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title={drive.jobRole}
        subtitle={`${drive.companyId?.name} • ${drive.title}`}
        breadcrumbs={[
          { label: 'Portal', to: '/dashboard' },
          { label: 'Placement Drives', to: '/drives' },
          { label: drive.jobRole },
        ]}
        badge={<StatusBadge status={drive.status} />}
        actions={
          <Link to="/drives" className="btn btn-secondary btn-sm">
            <ArrowLeft size={15} /> All Drives
          </Link>
        }
      />

      {/* Main Dossier Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Building2 size={16} /> {drive.companyId?.industry || 'Enterprise Partner'}
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', margin: '0.25rem 0' }}>
              {drive.companyId?.name}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Drive Commences: {formatDate(drive.driveDate)}
            </div>
          </div>
        </div>

        {/* Remuneration & Location Metrics Grid */}
        <div
          className="grid-cols-4"
          style={{
            marginBottom: '1.75rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ANNUAL CTC REMUNERATION
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--success)', marginTop: '0.15rem' }}>
              {ctcFormatted}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Base pay: {baseFormatted}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              WORK LOCATIONS
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {drive.jobLocations?.join(', ') || 'Campus / Multiple'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              MINIMUM CGPA REQUIRED
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', marginTop: '0.25rem' }}>
              ≥ {drive.eligibilityCriteria.minCgpa} CGPA
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Passout: {drive.eligibilityCriteria.graduationYear}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              APPLICATION DEADLINE
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-bold)',
                color: isDeadlineValid ? 'var(--text-primary)' : 'var(--danger)',
                marginTop: '0.25rem',
              }}
            >
              {formatDate(drive.applicationDeadline)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: isDeadlineValid ? 'var(--text-muted)' : 'var(--danger)' }}>
              {isDeadlineValid ? 'Active deadline' : 'Closed for applications'}
            </div>
          </div>
        </div>

        {applyError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              marginBottom: '1.5rem',
              fontSize: 'var(--text-sm)',
            }}
          >
            <AlertCircle size={18} />
            <span>{applyError}</span>
          </div>
        )}

        {/* Application Action Area */}
        {user?.role === 'student' && (
          <div>
            {userApplication ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.15rem 1.35rem',
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <FileCheck2 size={24} style={{ color: 'var(--success)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--success-text)', fontSize: 'var(--text-sm)' }}>
                      You have submitted your application for this position
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--success-text)', opacity: 0.9, marginTop: '0.15rem' }}>
                      Current status: <strong>{userApplication.status.toUpperCase()}</strong> (Selection Round {userApplication.currentRound})
                    </div>
                  </div>
                </div>
                <Link to="/applications" className="btn btn-secondary btn-sm">
                  Track in Applications Timeline →
                </Link>
              </div>
            ) : canApply ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                    Your academic profile meets all criteria for this drive
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    Your validated S3 resume and academic records will be submitted to {drive.companyId?.name}.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="btn btn-primary btn-lg"
                  style={{ padding: '0.85rem 2.25rem' }}
                >
                  {applying ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 0.9s linear infinite' }} /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> One-Click Apply Now
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '1.15rem 1.35rem',
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--danger-text)',
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                <div>
                  {!isDeadlineValid
                    ? 'Applications for this recruitment drive have officially closed.'
                    : 'You do not meet the minimum eligibility criteria required for this placement drive. Review the checklist below for specific reasons.'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid: Job Description & Automated Eligibility Engine Card */}
      <div className="grid-cols-2" style={{ alignItems: 'flex-start', gap: '1.75rem' }}>
        {/* Left: Job Description & Selection Process */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Job Role & Responsibilities
            </h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
              {drive.jobDescription}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Layers size={18} style={{ color: 'var(--primary)' }} />
              <span>Selection Rounds & Evaluation Stages</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {drive.selectionRounds && drive.selectionRounds.length > 0 ? (
                drive.selectionRounds.map((round) => (
                  <div
                    key={round.roundNumber}
                    style={{
                      padding: '0.85rem 1rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                    }}
                  >
                    <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                      Round {round.roundNumber}: {round.roundName}
                    </div>
                    {round.description && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {round.description}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: '0.5rem 0' }}>
                  Standard recruitment rounds (Online Screening, Technical Interview, HR Round).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Automated Real-Time Eligibility Engine Card */}
        <div className="card" style={{ border: '2px solid var(--border-default)' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                Automated Eligibility Evaluation
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Evaluated in real-time by the PlaceCloud matching engine
              </p>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Cloud Engine
            </span>
          </div>

          {user?.role !== 'student' ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Eligibility evaluation is dynamically rendered for active student candidate accounts.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Criterion 1: CGPA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: isCgpaMet ? 'var(--success-light)' : 'var(--danger-light)',
                  border: `1px solid ${isCgpaMet ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    Cumulative CGPA Threshold
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Required: ≥ {drive.eligibilityCriteria.minCgpa} • Your CGPA: <strong>{profile?.cgpa}</strong>
                  </div>
                </div>
                {isCgpaMet ? (
                  <CheckCircle2 color="var(--success)" size={20} />
                ) : (
                  <XCircle color="var(--danger)" size={20} />
                )}
              </div>

              {/* Criterion 2: Allowed Department */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: isDeptMet ? 'var(--success-light)' : 'var(--danger-light)',
                  border: `1px solid ${isDeptMet ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    Eligible Academic Branch
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Your Branch: <strong>{profile?.department}</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Allowed: {drive.eligibilityCriteria.allowedDepartments?.join(', ')}
                  </div>
                </div>
                {isDeptMet ? (
                  <CheckCircle2 color="var(--success)" size={20} />
                ) : (
                  <XCircle color="var(--danger)" size={20} />
                )}
              </div>

              {/* Criterion 3: Graduation Year */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: isYearMet ? 'var(--success-light)' : 'var(--danger-light)',
                  border: `1px solid ${isYearMet ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    Graduation Passout Batch
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Target Batch: {drive.eligibilityCriteria.graduationYear} • Your Year: <strong>{profile?.graduationYear}</strong>
                  </div>
                </div>
                {isYearMet ? (
                  <CheckCircle2 color="var(--success)" size={20} />
                ) : (
                  <XCircle color="var(--danger)" size={20} />
                )}
              </div>

              {/* Criterion 4: Backlogs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: isBacklogMet ? 'var(--success-light)' : 'var(--danger-light)',
                  border: `1px solid ${isBacklogMet ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    Maximum Standing Backlogs
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Allowed: ≤ {drive.eligibilityCriteria.maxBacklogs} • Your Backlogs: <strong>{profile?.activeBacklogs}</strong>
                  </div>
                </div>
                {isBacklogMet ? (
                  <CheckCircle2 color="var(--success)" size={20} />
                ) : (
                  <XCircle color="var(--danger)" size={20} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveDetailsPage;
