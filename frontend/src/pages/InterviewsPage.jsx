import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Tabs from '../components/Tabs';
import { SkeletonCard } from '../components/LoadingSpinner';
import { formatDate, formatDateTime } from '../utils/formatters';
import {
  Calendar,
  Video,
  Clock,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews/my-schedule');
      if (res.data.success) {
        setInterviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load interview schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingInterviews = interviews.filter((i) => new Date(i.scheduledDate) >= now);
  const pastInterviews = interviews.filter((i) => new Date(i.scheduledDate) < now);

  const displayedInterviews =
    activeTab === 'upcoming'
      ? upcomingInterviews
      : activeTab === 'past'
      ? pastInterviews
      : interviews;

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Calls', count: upcomingInterviews.length },
    { id: 'all', label: 'All Interview Calls', count: interviews.length },
    { id: 'past', label: 'Completed Rounds', count: pastInterviews.length },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <PageHeader
        title="Interview Schedule & Virtual Calls"
        subtitle="Access your scheduled virtual meeting links, campus room venues, and recruiter round instructions"
        breadcrumbs={[
          { label: 'Portal', to: '/dashboard' },
          { label: 'Interviews' },
        ]}
      />

      {/* Tabs */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <SkeletonCard height="160px" />
          <SkeletonCard height="160px" />
        </div>
      ) : displayedInterviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={activeTab === 'upcoming' ? 'No Upcoming Interviews' : 'No Interview Records Found'}
          description={
            activeTab === 'upcoming'
              ? 'You do not have any pending interview calls scheduled at this moment. When recruiters shortlist your profile, you will receive an alert here.'
              : 'There are no historical interview calls recorded in your placement account.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedInterviews.map((item) => {
            const drive = item.placementDriveId || {};
            const company = drive.companyId || {};
            const interviewDate = new Date(item.scheduledDate);
            const isUpcoming = interviewDate >= now;

            return (
              <div
                key={item._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  padding: '1.5rem',
                  borderLeft: isUpcoming ? '4px solid var(--primary)' : '4px solid var(--border-default)',
                  boxShadow: isUpcoming ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Building2 size={14} /> {company.name || 'Enterprise Partner'}
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 'var(--font-weight-bold)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '0.1rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Round {item.roundNumber}
                    </span>
                    {isUpcoming && (
                      <span className="badge badge-ongoing">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-extrabold)',
                      color: 'var(--text-primary)',
                      margin: '0.15rem 0',
                    }}
                  >
                    {item.roundName || 'Technical Interview Session'}
                  </h3>

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {drive.jobRole}
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Clock size={16} style={{ color: 'var(--primary)' }} />
                    <span>{formatDateTime(item.scheduledDate)}</span>
                  </div>

                  {item.instructions && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>Instructions from Recruiter:</strong> {item.instructions}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <a
                    href={item.locationOrMeetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Video size={16} /> Join Virtual Meeting
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InterviewsPage;
