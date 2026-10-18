import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
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
} from 'lucide-react';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      const [sumRes, appsRes] = await Promise.all([
        api.get('/analytics/admin-summary'),
        api.get('/applications?limit=6'),
      ]);

      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
      if (appsRes.data.success) {
        setRecentApplications(appsRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1` : '/api/v1';
    window.open(`${baseUrl}/reports/export-csv?token=${token}`, '_blank');
  };

  if (loading) return <LoadingSpinner message="Calculating institutional placement analytics..." />;

  const avgSalaryLpa = summary?.salaryStatistics?.averageSalary
    ? (summary.salaryStatistics.averageSalary / 100000).toFixed(2)
    : '0.00';
  const maxSalaryLpa = summary?.salaryStatistics?.highestSalary
    ? (summary.salaryStatistics.highestSalary / 100000).toFixed(2)
    : '0.00';

  return (
    <div>
      {/* Header with Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Placement Officer Command Center</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Campus placement progress, drive analytics, and candidate pipelines</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={15} /> Export Placement CSV
          </button>
          <Link to="/admin/drives" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={15} /> New Placement Drive
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Students"
          value={summary?.totalStudents || 0}
          subtitle="Registered candidates"
          icon={Users}
          color="#4f46e5"
          bgColor="#eef2ff"
        />
        <StatCard
          title="Placement Drives"
          value={summary?.totalDrives || 0}
          subtitle={`${summary?.activeDrivesCount || 0} currently active`}
          icon={Briefcase}
          color="#0ea5e9"
          bgColor="#f0f9ff"
        />
        <StatCard
          title="Partner Companies"
          value={summary?.totalCompanies || 0}
          subtitle="Active corporate recruiters"
          icon={Building2}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <StatCard
          title="Students Placed"
          value={summary?.totalSelectedStudents || 0}
          subtitle={`${summary?.placementRate || 0}% overall placement rate`}
          icon={Award}
          color="#10b981"
          bgColor="#ecfdf5"
        />
      </div>

      {/* Placement Rate Banner & Salary Metrics */}
      <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Institutional Placement Percentage
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.5rem 0' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{summary?.placementRate || 0}%</span>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingUp size={16} /> Verified Cohort
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Calculated dynamically as: (Unique Selected Candidates / Total Registered Student Population).
            </p>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(summary?.placementRate || 0, 100)}%`,
                  backgroundColor: '#10b981',
                  borderRadius: '999px',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Salary CTC Distribution */}
        <div className="card">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Salary Package Benchmarks (CTC)
          </div>
          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>HIGHEST PACKAGE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem' }}>
                {maxSalaryLpa} LPA
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 600 }}>AVERAGE PACKAGE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.25rem' }}>
                {avgSalaryLpa} LPA
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <Link to="/admin/analytics" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              View full charts & reports <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Recent Candidate Submissions</h2>
          <Link to="/admin/drives" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4f46e5' }}>
            Inspect drives →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem' }}>No recent applications.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Applied Drive</th>
                  <th>Company</th>
                  <th>Status</th>
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
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {student.firstName} {student.lastName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Roll: {student.collegeId}</div>
                      </td>
                      <td>{student.department}</td>
                      <td>
                        <strong style={{ color: '#4f46e5' }}>{student.cgpa}</strong>
                      </td>
                      <td>{drive.jobRole}</td>
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
    </div>
  );
};

export default AdminDashboard;
