import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Tabs from '../components/Tabs';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { SkeletonTable, SkeletonStatGrid } from '../components/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { formatLPA, formatDate } from '../utils/formatters';
import {
  Users,
  Briefcase,
  Calendar,
  Award,
  FileText,
  Clock,
  Video,
  Send,
  Building2,
  CheckCircle2,
  Search,
  Filter,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Ban,
  Loader2,
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [metrics, setMetrics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const debouncedSearch = useDebounce(search, 250);

  // Status Update & Interview Modal States
  const [selectedApp, setSelectedApp] = useState(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    roundNumber: 2,
    roundName: 'Technical Interview',
    scheduledDate: '',
    locationOrMeetingLink: 'https://meet.google.com/abc-defg-hij',
    instructions: 'Live technical problem solving and architecture review.',
  });
  const [scheduling, setScheduling] = useState(false);

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offeredSalary, setOfferedSalary] = useState('');
  const [publishingOffer, setPublishingOffer] = useState(false);

  // Resume loading state
  const [loadingResumeId, setLoadingResumeId] = useState(null);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    try {
      const [metricsRes, appsRes] = await Promise.all([
        api.get('/analytics/recruiter-summary'),
        api.get('/applications'),
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        toast.success('Candidate status updated', `Candidate moved to "${newStatus.replace('_', ' ')}".`);
        fetchRecruiterData();
      }
    } catch (err) {
      toast.error('Status update failed', err.response?.data?.message || 'Could not update candidate status.');
    }
  };

  const handleViewResume = async (studentId) => {
    setLoadingResumeId(studentId);
    try {
      const res = await api.get(`/resumes/view/${studentId}`);
      if (res.data.success) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (err) {
      toast.error('Resume Access Failed', err.response?.data?.message || 'Could not mint presigned resume URL.');
    } finally {
      setLoadingResumeId(null);
    }
  };

  const openInterviewModal = (app) => {
    setSelectedApp(app);
    // Suggest round number as currentRound + 1
    const nextRound = (app.currentRound || 1) + 1;
    setInterviewData({
      roundNumber: nextRound,
      roundName: nextRound === 2 ? 'Technical Assessment' : nextRound === 3 ? 'System Design & Problem Solving' : 'Executive HR Round',
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
      locationOrMeetingLink: 'https://meet.google.com/abc-defg-hij',
      instructions: 'Technical discussion and live code evaluation.',
    });
    setIsInterviewModalOpen(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      const res = await api.post('/interviews', {
        applicationId: selectedApp._id,
        roundNumber: Number(interviewData.roundNumber),
        roundName: interviewData.roundName,
        scheduledDate: interviewData.scheduledDate,
        locationOrMeetingLink: interviewData.locationOrMeetingLink,
        instructions: interviewData.instructions,
      });

      if (res.data.success) {
        setIsInterviewModalOpen(false);
        toast.success('Interview scheduled', `Candidate notified for Round ${interviewData.roundNumber}.`);
        await fetchRecruiterData();
      }
    } catch (err) {
      toast.error('Scheduling failed', err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const openOfferModal = (app) => {
    setSelectedApp(app);
    const driveCtc = app.placementDriveId?.salaryPackage?.ctc || 1200000;
    setOfferedSalary(driveCtc);
    setIsOfferModalOpen(true);
  };

  const handlePublishOffer = async (e) => {
    e.preventDefault();
    setPublishingOffer(true);
    try {
      const res = await api.post('/results', {
        placementDriveId: selectedApp.placementDriveId._id,
        studentId: selectedApp.studentId._id,
        companyId: profile?.companyId?._id || selectedApp.placementDriveId.companyId._id,
        offeredSalary: Number(offeredSalary),
      });

      if (res.data.success) {
        setIsOfferModalOpen(false);
        toast.success(
          'Candidate Hired & Offer Released!',
          `Confirmed offer of ${formatLPA(offeredSalary)} issued to ${selectedApp?.studentId?.firstName}.`
        );
        await fetchRecruiterData();
      }
    } catch (err) {
      toast.error('Offer release failed', err.response?.data?.message || 'Failed to publish offer.');
    } finally {
      setPublishingOffer(false);
    }
  };

  // Filter candidates
  const filteredApps = applications.filter((app) => {
    const student = app.studentId || {};
    const drive = app.placementDriveId || {};
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const rollId = (student.collegeId || '').toLowerCase();

    const matchesSearch =
      !debouncedSearch.trim() ||
      fullName.includes(debouncedSearch.toLowerCase()) ||
      rollId.includes(debouncedSearch.toLowerCase()) ||
      (drive.jobRole || '').toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStage = stageFilter === 'all' || app.status === stageFilter;
    const matchesDept = !deptFilter || student.department === deptFilter;
    const matchesCgpa = !minCgpaFilter || student.cgpa >= parseFloat(minCgpaFilter);

    return matchesSearch && matchesStage && matchesDept && matchesCgpa;
  });

  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const paginatedApps = filteredApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const companyName = profile?.companyId?.name || 'Recruiting Partner';
  const pipeline = metrics?.pipeline || {};

  const stageTabs = [
    { id: 'all', label: 'All Candidates', count: applications.length },
    { id: 'applied', label: 'Screening', count: applications.filter((a) => a.status === 'applied').length },
    { id: 'shortlisted', label: 'Shortlisted', count: applications.filter((a) => a.status === 'shortlisted').length },
    { id: 'interview_scheduled', label: 'Interviewing', count: applications.filter((a) => a.status === 'interview_scheduled').length },
    { id: 'selected', label: 'Offers Hired', count: applications.filter((a) => a.status === 'selected').length },
    { id: 'rejected', label: 'Archived', count: applications.filter((a) => a.status === 'rejected').length },
  ];

  return (
    <div>
      <PageHeader
        title={`${companyName} Talent Pipeline`}
        subtitle="Screen verified candidate profiles, review cloud resumes, and progress applicants through selection rounds"
        breadcrumbs={[
          { label: 'Recruiter' },
          { label: 'Talent Pipeline' },
        ]}
        badge={
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--info)',
              backgroundColor: 'var(--info-light)',
              padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--info-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Building2 size={12} /> Enterprise Hiring Partner
          </span>
        }
      />

      {/* Pipeline Funnel KPI Metric Cards */}
      {loading ? (
        <SkeletonStatGrid count={4} />
      ) : (
        <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Total Applicants"
            value={pipeline.totalApplications || 0}
            subtitle="Applied to company drives"
            icon={Users}
            color="var(--primary)"
            bgColor="var(--primary-light)"
          />
          <StatCard
            title="Shortlisted"
            value={pipeline.shortlisted || 0}
            subtitle="Cleared screening"
            icon={Briefcase}
            color="var(--info)"
            bgColor="var(--info-light)"
          />
          <StatCard
            title="In Interviews"
            value={pipeline.interviewScheduled || 0}
            subtitle="Scheduled virtual calls"
            icon={Calendar}
            color="var(--warning)"
            bgColor="var(--warning-light)"
          />
          <StatCard
            title="Offers Extended"
            value={pipeline.selected || 0}
            subtitle="Selections confirmed"
            icon={Award}
            color="var(--success)"
            bgColor="var(--success-light)"
          />
        </div>
      )}

      {/* Discovery & Screening Controls Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <Tabs
            tabs={stageTabs}
            activeTab={stageFilter}
            onChange={(tabId) => {
              setStageFilter(tabId);
              setCurrentPage(1);
            }}
            size="sm"
          />

          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <input
              type="text"
              placeholder="Search candidate name, roll ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-xs)' }}
              aria-label="Search applicants"
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
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  padding: '0.2rem',
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Secondary filters: Branch & Min CGPA */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '220px' }}>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ fontSize: 'var(--text-xs)', padding: '0.45rem 0.75rem' }}
              aria-label="Filter by department"
            >
              <option value="">All Academic Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          <div style={{ width: '160px' }}>
            <input
              type="number"
              step="0.5"
              placeholder="Min CGPA (e.g. 8.0)"
              value={minCgpaFilter}
              onChange={(e) => {
                setMinCgpaFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ fontSize: 'var(--text-xs)', padding: '0.45rem 0.75rem' }}
              aria-label="Filter by minimum CGPA"
            />
          </div>

          {(search || stageFilter !== 'all' || deptFilter || minCgpaFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStageFilter('all');
                setDeptFilter('');
                setMinCgpaFilter('');
                setCurrentPage(1);
              }}
              className="btn btn-ghost btn-xs"
              style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <X size={13} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || stageFilter !== 'all' ? 'No Matching Applicants' : 'No Candidates Applied Yet'}
          description={
            search || stageFilter !== 'all'
              ? 'No candidate records match your active search and criteria filters.'
              : 'There are currently no candidate applications submitted for your enterprise placement drives.'
          }
        />
      ) : (
        <div className="table-container">
          <table aria-label="Recruiter applicant management table">
            <thead>
              <tr>
                <th scope="col">Candidate Name</th>
                <th scope="col">Roll ID</th>
                <th scope="col">Branch</th>
                <th scope="col">CGPA / Backlogs</th>
                <th scope="col">Cloud Resume</th>
                <th scope="col">Stage</th>
                <th scope="col">Actions & Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.map((app) => {
                const student = app.studentId || {};
                const drive = app.placementDriveId || {};
                const isViewingResume = loadingResumeId === student._id;

                return (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                        {student.firstName} {student.lastName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Applied for: {drive.jobRole || 'Campus Drive'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' }}>
                      {student.collegeId}
                    </td>
                    <td>{student.department}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <strong style={{ color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>
                          {student.cgpa}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ({student.activeBacklogs} backlogs)
                        </span>
                      </div>
                    </td>
                    <td>
                      {student.resumeS3Key ? (
                        <button
                          type="button"
                          onClick={() => handleViewResume(student._id)}
                          disabled={isViewingResume}
                          className="btn btn-secondary btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Open 15-minute presigned AWS S3 link"
                        >
                          {isViewingResume ? (
                            <Loader2 size={13} style={{ animation: 'spin 0.9s linear infinite' }} />
                          ) : (
                            <FileText size={13} style={{ color: 'var(--primary)' }} />
                          )}
                          <span>Resume (S3)</span>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.72rem' }}>
                          No document
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {app.status === 'applied' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                            className="btn btn-secondary btn-xs"
                            style={{ color: 'var(--info)', fontWeight: 'var(--font-weight-semibold)' }}
                          >
                            Shortlist
                          </button>
                        )}

                        {app.status !== 'selected' && app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => openInterviewModal(app)}
                            className="btn btn-secondary btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning-text)' }}
                          >
                            <Video size={13} /> Call Interview
                          </button>
                        )}

                        {app.status !== 'selected' && app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => openOfferModal(app)}
                            className="btn btn-success btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Award size={13} /> Offer Job
                          </button>
                        )}

                        {app.status !== 'rejected' && app.status !== 'selected' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                            className="btn btn-outline-danger btn-xs"
                          >
                            Reject
                          </button>
                        )}
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
            totalRecords={filteredApps.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title={`Schedule Interview: ${selectedApp?.studentId?.firstName} ${selectedApp?.studentId?.lastName}`}
        subtitle={`Candidate: ${selectedApp?.studentId?.collegeId} (${selectedApp?.studentId?.department})`}
        maxWidth="560px"
      >
        <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label htmlFor="inv-round-num" className="form-label">
                Round Number <span className="required">*</span>
              </label>
              <input
                id="inv-round-num"
                type="number"
                min="1"
                required
                value={interviewData.roundNumber}
                onChange={(e) => setInterviewData({ ...interviewData, roundNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="inv-round-name" className="form-label">
                Round Title / Topic <span className="required">*</span>
              </label>
              <input
                id="inv-round-name"
                type="text"
                required
                placeholder="e.g. System Design & Algorithmic Round"
                value={interviewData.roundName}
                onChange={(e) => setInterviewData({ ...interviewData, roundName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="inv-date" className="form-label">
              Scheduled Date & Time <span className="required">*</span>
            </label>
            <input
              id="inv-date"
              type="datetime-local"
              required
              value={interviewData.scheduledDate}
              onChange={(e) => setInterviewData({ ...interviewData, scheduledDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inv-link" className="form-label">
              Video Meeting Link or Room Location <span className="required">*</span>
            </label>
            <input
              id="inv-link"
              type="text"
              required
              placeholder="https://meet.google.com/... or Campus Room 302"
              value={interviewData.locationOrMeetingLink}
              onChange={(e) => setInterviewData({ ...interviewData, locationOrMeetingLink: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="inv-instructions" className="form-label">
              Special Instructions for Candidate
            </label>
            <textarea
              id="inv-instructions"
              rows={3}
              placeholder="Please have your camera on, prepare to screen-share IDE..."
              value={interviewData.instructions}
              onChange={(e) => setInterviewData({ ...interviewData, instructions: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsInterviewModalOpen(false)}
              disabled={scheduling}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={scheduling}>
              {scheduling ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} /> Scheduling...
                </>
              ) : (
                <>
                  <Calendar size={16} /> Confirm & Notify Student
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Release Job Offer Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title={`Extend Job Offer: ${selectedApp?.studentId?.firstName} ${selectedApp?.studentId?.lastName}`}
        subtitle={`Position: ${selectedApp?.placementDriveId?.jobRole}`}
        maxWidth="500px"
      >
        <form onSubmit={handlePublishOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--success-light)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--success-text)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.5,
            }}
          >
            Marking candidate as <strong>Selected</strong> will officially confirm their placement with your organization and trigger celebratory student notifications.
          </div>

          <div className="form-group">
            <label htmlFor="offer-salary" className="form-label">
              Offered Annual CTC (INR) <span className="required">*</span>
            </label>
            <input
              id="offer-salary"
              type="number"
              required
              min="100000"
              step="50000"
              placeholder="e.g. 1500000"
              value={offeredSalary}
              onChange={(e) => setOfferedSalary(e.target.value)}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Equivalent to: <strong style={{ color: 'var(--success)' }}>{formatLPA(offeredSalary)}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsOfferModalOpen(false)}
              disabled={publishingOffer}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={publishingOffer}>
              {publishingOffer ? 'Publishing Offer...' : 'Confirm Selection & Release Offer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;
