import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { SkeletonStatGrid, SkeletonCard } from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { formatLPA } from '../utils/formatters';
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
import {
  Download,
  BarChart3,
  TrendingUp,
  Award,
  Building2,
  Users,
  Calendar,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

const AnalyticsReportsPage = () => {
  const { resolvedTheme } = useTheme();

  const [summary, setSummary] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // CSV Export Filter State
  const [exportDept, setExportDept] = useState('');
  const [exportBatch, setExportBatch] = useState('');

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
    const cleanBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    const baseUrl = cleanBase ? `${cleanBase}/api/v1` : '/api/v1';
    const params = new URLSearchParams();
    if (token) params.append('token', token);
    if (exportDept) params.append('department', exportDept);
    if (exportBatch) params.append('graduationYear', exportBatch);

    window.open(`${baseUrl}/reports/export-csv?${params.toString()}`, '_blank');
  };

  // Theme-adaptive colors for Recharts
  const isDark = resolvedTheme === 'dark';
  const gridStroke = isDark ? '#26334a' : '#e2e8f0';
  const textFill = isDark ? '#94a3b8' : '#64748b';
  const totalBarFill = isDark ? '#1e293b' : '#cbd5e1';
  const placedBarFill = isDark ? '#6366f1' : '#4f46e5';
  const hireBarFill = isDark ? '#10b981' : '#059669';
  const tooltipBg = isDark ? '#111827' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton" style={{ width: '45%', height: '2rem', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ width: '65%', height: '1rem' }} />
        </div>
        <SkeletonStatGrid count={4} />
        <div style={{ marginBottom: '2rem' }}>
          <SkeletonCard height="360px" />
        </div>
        <SkeletonCard height="340px" />
      </div>
    );
  }

  // Transform department names for clean chart axis
  const formattedDeptData = deptData.map((d) => ({
    name: d.department
      .replace('Engineering', 'Eng.')
      .replace('Computer Science', 'CSE')
      .replace('Information Technology', 'IT')
      .replace('Electronics & Communication', 'ECE'),
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
      <PageHeader
        title="Institutional Placement Analytics & Accreditation"
        subtitle="Real-time cohort visualizations and one-click NAAC / NBA compliance CSV reports"
        breadcrumbs={[
          { label: 'Admin' },
          { label: 'Analytics & Reports' },
        ]}
      />

      {/* CSV Export Bar Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                NAAC / NBA Institutional Placement Report (CSV Stream)
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Filter by academic department or graduation year for customized compliance reporting
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <select
              value={exportDept}
              onChange={(e) => setExportDept(e.target.value)}
              style={{ fontSize: 'var(--text-xs)', padding: '0.45rem 1.8rem 0.45rem 0.75rem', width: 'auto' }}
              aria-label="Filter export by branch"
            >
              <option value="">All Academic Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>

            <select
              value={exportBatch}
              onChange={(e) => setExportBatch(e.target.value)}
              style={{ fontSize: 'var(--text-xs)', padding: '0.45rem 1.8rem 0.45rem 0.75rem', width: 'auto' }}
              aria-label="Filter export by passout year"
            >
              <option value="">All Batch Years</option>
              <option value="2025">Batch 2025</option>
              <option value="2026">Batch 2026</option>
              <option value="2027">Batch 2027</option>
            </select>

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={14} /> Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Registered Students"
          value={summary?.totalStudents || 0}
          subtitle="Active candidate pool"
          icon={Users}
          color="var(--primary)"
          bgColor="var(--primary-light)"
        />
        <StatCard
          title="Placed Candidates"
          value={summary?.totalSelectedStudents || 0}
          subtitle="Confirmed offers issued"
          icon={Award}
          color="var(--success)"
          bgColor="var(--success-light)"
        />
        <StatCard
          title="Placement Rate"
          value={`${summary?.placementRate || 0}%`}
          subtitle="Overall cohort velocity"
          icon={TrendingUp}
          color="var(--color-accent-600)"
          bgColor="var(--color-accent-50)"
          trend={{ label: `${summary?.placementRate || 0}%`, positive: true }}
        />
        <StatCard
          title="Max Remuneration"
          value={summary?.salaryStatistics?.highestSalary ? formatLPA(summary.salaryStatistics.highestSalary) : '0.0 LPA'}
          subtitle="Annual package CTC"
          icon={Building2}
          color="var(--warning)"
          bgColor="var(--warning-light)"
        />
      </div>

      {/* Chart 1: Department Placed vs Total Students */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={19} style={{ color: 'var(--primary)' }} />
              <span>Department-Wise Placement Distribution (Total vs Placed)</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: '0.2rem' }}>
              Direct comparison of registered students versus candidates with confirmed job offers per engineering department
            </p>
          </div>
        </div>

        <div style={{ height: '360px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedDeptData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" stroke={textFill} fontSize={12} tickLine={false} />
              <YAxis stroke={textFill} fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '8px',
                  color: tooltipText,
                  boxShadow: 'var(--shadow-lg)',
                  fontSize: '0.8rem',
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />
              <Bar dataKey="Total" fill={totalBarFill} radius={[4, 4, 0, 0]} name="Total Registered" />
              <Bar dataKey="Placed" fill={placedBarFill} radius={[4, 4, 0, 0]} name="Successfully Placed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Corporate Partner Hiring Intake & Remuneration */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={19} style={{ color: 'var(--success)' }} />
              <span>Enterprise Partner Intake & Average Package (LPA)</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: '0.2rem' }}>
              Total candidate selections and average remuneration package per corporate recruiting organization
            </p>
          </div>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedCompanyData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" stroke={textFill} fontSize={12} tickLine={false} />
              <YAxis stroke={textFill} fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '8px',
                  color: tooltipText,
                  boxShadow: 'var(--shadow-lg)',
                  fontSize: '0.8rem',
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />
              <Bar dataKey="Hires" fill={hireBarFill} radius={[4, 4, 0, 0]} name="Candidate Hires" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportsPage;
