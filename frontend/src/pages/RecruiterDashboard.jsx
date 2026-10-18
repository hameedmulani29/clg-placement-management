import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
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
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Update & Interview Modal States
  const [selectedApp, setSelectedApp] = useState(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    roundNumber: 2,
    roundName: 'Technical Interview',
    scheduledDate: '',
    locationOrMeetingLink: 'https://meet.google.com/abc-defg-hij',
    instructions: 'Live coding session and systems discussion.',
  });
  const [scheduling, setScheduling] = useState(false);

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offeredSalary, setOfferedSalary] = useState('');
  const [publishingOffer, setPublishingOffer] = useState(false);

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
        fetchRecruiterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewResume = async (studentId) => {
    try {
      const res = await api.get(`/resumes/view/${studentId}`);
      if (res.data.success) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not access candidate resume.');
    }
  };

  const openInterviewModal = (app) => {
    setSelectedApp(app);
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
        await fetchRecruiterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview.');
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
        await fetchRecruiterData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish offer.');
    } finally {
      setPublishingOffer(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recruiter dashboard..." />;

  const companyName = profile?.companyId?.name || 'Recruiting Partner';
  const pipeline = metrics?.pipeline || {};

  return (
    <div>
      {/* Welcome & Company Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          <Building2 size={16} /> {companyName}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
          Recruiter Talent Pipeline
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Review eligible candidates, inspect verified S3 resumes, and progress applicants through selection rounds
        </p>
      </div>

      {/* Pipeline Funnel KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Applicants"
          value={pipeline.totalApplications || 0}
          subtitle="Candidates applied"
          icon={Users}
          color="#4f46e5"
          bgColor="#eef2ff"
        />
        <StatCard
          title="Shortlisted"
          value={pipeline.shortlisted || 0}
          subtitle="Cleared initial screening"
          icon={Briefcase}
          color="#0ea5e9"
          bgColor="#f0f9ff"
        />
        <StatCard
          title="In Interviews"
          value={pipeline.interviewScheduled || 0}
          subtitle="Active round calls"
          icon={Calendar}
          color="#d97706"
          bgColor="#fffbeb"
        />
        <StatCard
          title="Offers Released"
          value={pipeline.selected || 0}
          subtitle="Candidates hired"
          icon={Award}
          color="#10b981"
          bgColor="#ecfdf5"
        />
      </div>

      {/* Candidate Pipeline Table */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
          Applicant Screening & Selection Table
        </h2>

        {applications.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            No candidates have submitted applications for your company drives yet.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Roll ID</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Cloud Resume</th>
                  <th>Current Stage</th>
                  <th>Actions & Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const student = app.studentId || {};
                  return (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {student.firstName} {student.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.userId?.email}</div>
                      </td>
                      <td>{student.collegeId}</td>
                      <td>{student.department}</td>
                      <td>
                        <strong style={{ color: '#4f46e5' }}>{student.cgpa}</strong>
                      </td>
                      <td>{student.activeBacklogs}</td>
                      <td>
                        {student.resumeS3Key ? (
                          <button
                            onClick={() => handleViewResume(student._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                          >
                            <FileText size={13} color="#4f46e5" /> Open S3 Link
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No Resume</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {app.status === 'applied' && (
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#2563eb' }}
                            >
                              Shortlist
                            </button>
                          )}

                          {app.status !== 'selected' && app.status !== 'rejected' && (
                            <button
                              onClick={() => openInterviewModal(app)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d97706' }}
                            >
                              <Video size={13} /> Interview
                            </button>
                          )}

                          {app.status !== 'selected' && app.status !== 'rejected' && (
                            <button
                              onClick={() => openOfferModal(app)}
                              className="btn btn-success btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Award size={13} /> Select / Offer
                            </button>
                          )}

                          {app.status !== 'rejected' && app.status !== 'selected' && (
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'rejected')}
                              className="btn btn-outline-danger btn-sm"
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
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      <Modal isOpen={isInterviewModalOpen} onClose={() => setIsInterviewModalOpen(false)} title={`Schedule Interview for ${selectedApp?.studentId?.firstName} ${selectedApp?.studentId?.lastName}`}>
        <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Round Number *</label>
              <input
                type="number"
                min="1"
                required
                value={interviewData.roundNumber}
                onChange={(e) => setInterviewData({ ...interviewData, roundNumber: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Round Title *</label>
              <input
                type="text"
                required
                value={interviewData.roundName}
                onChange={(e) => setInterviewData({ ...interviewData, roundName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={interviewData.scheduledDate}
              onChange={(e) => setInterviewData({ ...interviewData, scheduledDate: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Virtual Meeting Link (Google Meet / Teams) *</label>
            <input
              type="url"
              required
              value={interviewData.locationOrMeetingLink}
              onChange={(e) => setInterviewData({ ...interviewData, locationOrMeetingLink: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Candidate Instructions</label>
            <textarea
              rows={2}
              value={interviewData.instructions}
              onChange={(e) => setInterviewData({ ...interviewData, instructions: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsInterviewModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={scheduling} className="btn btn-primary">{scheduling ? 'Scheduling...' : 'Send Interview Call'}</button>
          </div>
        </form>
      </Modal>

      {/* Publish Offer Modal */}
      <Modal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title={`Declare Job Offer: ${selectedApp?.studentId?.firstName} ${selectedApp?.studentId?.lastName}`}>
        <form onSubmit={handlePublishOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Offered Annual CTC (INR) *</label>
            <input
              type="number"
              required
              value={offeredSalary}
              onChange={(e) => setOfferedSalary(e.target.value)}
            />
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
              Equivalent to: {(Number(offeredSalary) / 100000).toFixed(2)} LPA
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '0.88rem' }}>
            Publishing this selection will automatically transition candidate status to <strong>SELECTED</strong> and notify the student.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsOfferModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={publishingOffer} className="btn btn-success">{publishingOffer ? 'Publishing...' : 'Confirm Job Selection'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;
