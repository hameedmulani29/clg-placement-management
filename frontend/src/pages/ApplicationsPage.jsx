import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { FileCheck2, Building2, Calendar, Award, ExternalLink } from 'lucide-react';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      if (res.data.success) {
        setApplications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  if (loading) return <LoadingSpinner message="Retrieving your application history..." />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>My Applications & Timeline</h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Track the progress of your submissions across interview rounds</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <EmptyState
          title="No Applications in this Category"
          description="You do not have any applications matching this status."
          actionText="Browse Open Drives"
          onAction={() => (window.location.href = '/drives')}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Job Role</th>
                <th>Package (CTC)</th>
                <th>Applied Date</th>
                <th>Current Round</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const drive = app.placementDriveId || {};
                const company = drive.companyId || {};
                const ctcLpa = drive.salaryPackage ? (drive.salaryPackage.ctc / 100000).toFixed(2) : 'N/A';
                return (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{company.name || 'Company'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{company.industry}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{drive.jobRole || 'Software Engineer'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>{ctcLpa} LPA</span>
                    </td>
                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#4f46e5' }}>Round {app.currentRound}</span>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link to={`/drives/${drive._id}`} className="btn btn-secondary btn-sm">
                        View Drive <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
