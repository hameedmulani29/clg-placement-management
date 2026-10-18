import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import EligibilityBadge from '../components/EligibilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, FileCheck2, Calendar, Award, ArrowRight, AlertTriangle, FileUp } from 'lucide-react';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [drivesRes, appsRes] = await Promise.all([
        api.get('/drives?limit=5'),
        api.get('/applications/my-applications'),
      ]);

      if (drivesRes.data.success) {
        setDrives(drivesRes.data.data || []);
      }
      if (appsRes.data.success) {
        setApplications(appsRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your placement dashboard..." />;

  const appliedCount = applications.length;
  const interviewCount = applications.filter((a) => a.status === 'interview_scheduled').length;
  const selectedCount = applications.filter((a) => a.status === 'selected').length;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Welcome back, {profile?.firstName || 'Student'}! 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.2rem' }}>
          {profile?.department} • Roll No: {profile?.collegeId} • CGPA: {profile?.cgpa}
        </p>
      </div>

      {/* Missing Resume Warning Banner */}
      {!profile?.resumeS3Key && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b45309' }}>
            <AlertTriangle size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Resume missing from cloud vault</div>
              <div style={{ fontSize: '0.82rem' }}>Upload your resume in PDF format to enable recruiters to review your profile.</div>
            </div>
          </div>
          <Link to="/profile" className="btn btn-warning btn-sm" style={{ backgroundColor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileUp size={15} /> Upload Resume
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Active Drives"
          value={drives.length}
          subtitle="Open for application"
          icon={Briefcase}
          color="#4f46e5"
          bgColor="#eef2ff"
        />
        <StatCard
          title="Applied"
          value={appliedCount}
          subtitle="Drives submitted"
          icon={FileCheck2}
          color="#0ea5e9"
          bgColor="#f0f9ff"
        />
        <StatCard
          title="Interviews"
          value={interviewCount}
          subtitle="Active interview rounds"
          icon={Calendar}
          color="#d97706"
          bgColor="#fffbeb"
        />
        <StatCard
          title="Offers Won"
          value={selectedCount}
          subtitle="Confirmed job selections"
          icon={Award}
          color="#10b981"
          bgColor="#ecfdf5"
        />
      </div>

      {/* Main Content Columns */}
      <div className="grid-cols-2" style={{ alignItems: 'flex-start' }}>
        {/* Available Placement Drives */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Upcoming Placement Drives</h2>
            <Link to="/drives" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {drives.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No drives currently scheduled.</p>
            ) : (
              drives.slice(0, 4).map((drive) => {
                const ctcLpa = (drive.salaryPackage?.ctc / 100000).toFixed(1);
                return (
                  <div
                    key={drive._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      border: '1px solid #f1f5f9',
                      borderRadius: '10px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{drive.jobRole}</div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                        {drive.companyId?.name} • <strong>{ctcLpa} LPA</strong>
                      </div>
                      <div style={{ marginTop: '0.4rem' }}>
                        {drive.eligibility && (
                          <EligibilityBadge
                            isEligible={drive.eligibility.isEligible}
                            reasons={drive.eligibility.reasons}
                          />
                        )}
                      </div>
                    </div>
                    <Link to={`/drives/${drive._id}`} className="btn btn-secondary btn-sm">
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>My Applications</h2>
            <Link to="/applications" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Full history <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                You have not applied to any placement drives yet.
              </p>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div
                  key={app._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: '1px solid #f1f5f9',
                    borderRadius: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                      {app.placementDriveId?.jobRole || 'Job Application'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                      {app.placementDriveId?.companyId?.name || 'Company'} • Round {app.currentRound}
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
    </div>
  );
};

export default StudentDashboard;
