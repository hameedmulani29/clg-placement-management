import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Calendar, Video, Clock, Building2, CheckCircle2 } from 'lucide-react';

const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingSpinner message="Retrieving scheduled interview calls..." />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Interview Calendar & Calls</h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Access your scheduled virtual meeting links and recruiter instructions</p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Scheduled Interviews"
          description="You do not have any pending interview calls scheduled at this moment."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {interviews.map((item) => {
            const drive = item.placementDriveId || {};
            const company = drive.companyId || {};
            const dateStr = new Date(item.scheduledDate).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  borderLeft: '4px solid #4f46e5',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                    <Building2 size={15} /> {company.name || 'Company'}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                    Round {item.roundNumber}: {item.roundName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.88rem' }}>
                    <Clock size={15} /> {dateStr}
                  </div>
                  {item.instructions && (
                    <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
                      <strong>Instructions:</strong> {item.instructions}
                    </div>
                  )}
                </div>

                <div>
                  <a
                    href={item.locationOrMeetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Video size={17} /> Join Meeting Room
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
