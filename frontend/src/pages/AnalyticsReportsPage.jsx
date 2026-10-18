import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, BarChart3, TrendingUp, Award, Building2 } from 'lucide-react';

const AnalyticsReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [sumRes, deptRes, compRes] = await Promise.all([
        api.get('/analytics/admin-summary'),
        api.get('/analytics/department-wise'),
        api.get('/analytics/company-wise'),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (deptRes.data.success) setDeptData(deptRes.data.data || []);
      if (compRes.data.success) setCompanyData(compRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1` : '/api/v1';
    window.open(`${baseUrl}/reports/export-csv?token=${token}`, '_blank');
  };

  if (loading) return <LoadingSpinner message="Rendering institutional placement charts..." />;

  // Transform department names for clean chart axis
  const formattedDeptData = deptData.map((d) => ({
    name: d.department.replace('Engineering', 'Eng.').replace('Computer Science', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Communication', 'ECE'),
    Total: d.totalStudents,
    Placed: d.placedStudents,
    Percentage: d.placementPercentage,
  }));

  const formattedCompanyData = companyData.map((c) => ({
    name: c.companyName,
    Hires: c.totalHires,
    AverageLPA: c.averagePackage ? Number((c.averagePackage / 100000).toFixed(1)) : 0,
  }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Placement Analytics & Accreditation Reports</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Comprehensive real-time charts compliant with NAAC / NBA audit criteria</p>
        </div>
        <button onClick={handleDownloadCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Download size={16} /> Download Full Placement Report (CSV)
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL REGISTERED STUDENTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>{summary?.totalStudents || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified student database</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>UNIQUE CANDIDATES PLACED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', margin: '0.2rem 0' }}>{summary?.totalSelectedStudents || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Unique individual offers</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>OVERALL PLACEMENT RATE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4f46e5', margin: '0.2rem 0' }}>{summary?.placementRate || 0}%</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>True institutional cohort rate</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MAX CTC PACKAGE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', margin: '0.2rem 0' }}>
            {summary?.salaryStatistics?.highestSalary ? (summary.salaryStatistics.highestSalary / 100000).toFixed(1) : 0} LPA
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Annual remuneration</div>
        </div>
      </div>

      {/* Chart 1: Department Placed vs Total Students */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} color="#4f46e5" /> Department-Wise Student Placements (Total vs Placed)
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Direct comparison of eligible registered student volume versus confirmed offers per academic discipline.
        </p>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedDeptData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Total" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Total Registered" />
              <Bar dataKey="Placed" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Successfully Placed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Company Recruitment Distribution */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="#10b981" /> Corporate Partner Hiring Volume & Average CTC
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Aggregate candidate intake and average package offered across recruiting partners.
        </p>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedCompanyData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Hires" fill="#10b981" radius={[4, 4, 0, 0]} name="Total Offers" />
              <Bar dataKey="AverageLPA" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Average Package (LPA)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportsPage;
