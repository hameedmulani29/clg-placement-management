import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
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
} from 'lucide-react';

const DriveDetailsPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(null);
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
        setApplicationSuccess(res.data.data);
        await fetchDriveDetails();
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Application submission failed.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner message="Evaluating drive eligibility..." />;
  if (!data?.drive) return <div className="card">Placement drive details not found.</div>;

  const { drive, eligibility, userApplication } = data;
  const ctcLpa = (drive.salaryPackage?.ctc / 100000).toFixed(2);
  const baseLpa = (drive.salaryPackage?.base / 100000).toFixed(2);

  // Criteria evaluation checks
  const isCgpaMet = profile ? profile.cgpa >= drive.eligibilityCriteria.minCgpa : false;
  const isDeptMet = profile ? drive.eligibilityCriteria.allowedDepartments.includes(profile.department) : false;
  const isYearMet = profile ? profile.graduationYear === drive.eligibilityCriteria.graduationYear : false;
  const isBacklogMet = profile ? profile.activeBacklogs <= drive.eligibilityCriteria.maxBacklogs : false;
  const isDeadlineValid = new Date() <= new Date(drive.applicationDeadline);

  const canApply = user?.role === 'student' && eligibility?.isEligible && !userApplication && isDeadlineValid;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <Link to="/drives" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to Drives Catalog
      </Link>

      {/* Main Drive Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <Building2 size={16} /> {drive.companyId?.name}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
              {drive.jobRole}
            </h1>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{drive.title}</div>
          </div>
          <div>
            <StatusBadge status={drive.status} />
          </div>
        </div>

        {/* Salary & Details Bar */}
        <div className="grid-cols-4" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>ANNUAL CTC PACKAGE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{ctcLpa} LPA</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Base: {baseLpa} LPA</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>JOB LOCATIONS</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
              {drive.jobLocations?.join(', ')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>DRIVE DATE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
              {new Date(drive.driveDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>APPLICATION DEADLINE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isDeadlineValid ? '#0f172a' : '#ef4444' }}>
              {new Date(drive.applicationDeadline).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Application Alerts */}
        {applicationSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={20} />
            <div>
              <div style={{ fontWeight: 700 }}>Application Successfully Submitted!</div>
              <div style={{ fontSize: '0.85rem' }}>Your resume and academic profile have been shared with {drive.companyId?.name}.</div>
            </div>
          </div>
        )}

        {applyError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{applyError}</span>
          </div>
        )}

        {/* Application Action Button */}
        {user?.role === 'student' && (
          <div>
            {userApplication ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileCheck2 size={24} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#166534' }}>You have applied for this position</div>
                    <div style={{ fontSize: '0.82rem', color: '#15803d' }}>
                      Status: <strong>{userApplication.status.toUpperCase()}</strong> (Round {userApplication.currentRound})
                    </div>
                  </div>
                </div>
                <Link to="/applications" className="btn btn-secondary btn-sm">
                  Track Stage →
                </Link>
              </div>
            ) : canApply ? (
              <button onClick={handleApply} disabled={applying} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                <Send size={18} /> {applying ? 'Submitting Application...' : 'One-Click Apply Now'}
              </button>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', color: '#9f1239', fontSize: '0.9rem' }}>
                {!isDeadlineValid
                  ? 'Applications for this placement drive have closed.'
                  : 'You do not meet the minimum eligibility criteria required for this placement drive.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid: Job Description & Automated Eligibility Engine Card */}
      <div className="grid-cols-2" style={{ alignItems: 'flex-start' }}>
        {/* Job Description & Selection Rounds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Job Description</h2>
            <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {drive.jobDescription}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Selection Process</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {drive.selectionRounds?.map((round) => (
                <div key={round.roundNumber} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                    Round {round.roundNumber}: {round.roundName}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {round.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Automated Eligibility Evaluation Card */}
        <div className="card" style={{ border: '2px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Automated Eligibility Check</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#eef2ff', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
              Cloud Engine
            </span>
          </div>

          {user?.role !== 'student' ? (
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Eligibility evaluation is dynamically rendered for active student accounts.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Criterion 1: CGPA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: isCgpaMet ? '#f0fdf4' : '#fef2f2', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Cumulative CGPA</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Required: ≥ {drive.eligibilityCriteria.minCgpa} • Your CGPA: {profile?.cgpa}
                  </div>
                </div>
                {isCgpaMet ? <CheckCircle2 color="#16a34a" size={20} /> : <XCircle color="#dc2626" size={20} />}
              </div>

              {/* Criterion 2: Allowed Department */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: isDeptMet ? '#f0fdf4' : '#fef2f2', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Eligible Branch</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Your Department: {profile?.department}
                  </div>
                </div>
                {isDeptMet ? <CheckCircle2 color="#16a34a" size={20} /> : <XCircle color="#dc2626" size={20} />}
              </div>

              {/* Criterion 3: Graduation Year */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: isYearMet ? '#f0fdf4' : '#fef2f2', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Passout Batch</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Target Batch: {drive.eligibilityCriteria.graduationYear} • Your Batch: {profile?.graduationYear}
                  </div>
                </div>
                {isYearMet ? <CheckCircle2 color="#16a34a" size={20} /> : <XCircle color="#dc2626" size={20} />}
              </div>

              {/* Criterion 4: Active Backlogs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: isBacklogMet ? '#f0fdf4' : '#fef2f2', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>Active Backlogs</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Allowed: ≤ {drive.eligibilityCriteria.maxBacklogs} • Your Backlogs: {profile?.activeBacklogs}
                  </div>
                </div>
                {isBacklogMet ? <CheckCircle2 color="#16a34a" size={20} /> : <XCircle color="#dc2626" size={20} />}
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                Overall Verdict:{' '}
                <span style={{ color: eligibility?.isEligible ? '#16a34a' : '#dc2626' }}>
                  {eligibility?.isEligible ? 'CONFIRMED ELIGIBLE TO APPLY' : 'CURRENTLY NOT ELIGIBLE'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveDetailsPage;
