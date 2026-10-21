import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Tabs from '../components/Tabs';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/LoadingSpinner';
import { formatLPA, formatDate } from '../utils/formatters';
import {
  FileCheck2,
  Building2,
  Calendar,
  Award,
  ExternalLink,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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

  // Filter and search
  const filteredApps = applications.filter((app) => {
    const drive = app.placementDriveId || {};
    const company = drive.companyId || {};

    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch =
      !search.trim() ||
      (drive.jobRole && drive.jobRole.toLowerCase().includes(search.toLowerCase())) ||
      (company.name && company.name.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const paginatedApps = filteredApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Tab items with counts
  const statusTabs = [
    { id: 'all', label: 'All Submissions', count: applications.length },
    { id: 'applied', label: 'Applied', count: applications.filter((a) => a.status === 'applied').length },
    { id: 'shortlisted', label: 'Shortlisted', count: applications.filter((a) => a.status === 'shortlisted').length },
    { id: 'interview_scheduled', label: 'Interview Scheduled', count: applications.filter((a) => a.status === 'interview_scheduled').length },
    { id: 'selected', label: 'Selected / Hired', count: applications.filter((a) => a.status === 'selected').length },
    { id: 'rejected', label: 'Archived', count: applications.filter((a) => a.status === 'rejected').length },
  ];

  return (
    <div>
      <PageHeader
        title="My Applications & Selection Pipeline"
        subtitle="Track your campus recruitment submissions, round progressions, and recruiter decisions"
        breadcrumbs={[
          { label: 'Portal', to: '/dashboard' },
          { label: 'My Applications' },
        ]}
        actions={
          <Link to="/drives" className="btn btn-primary btn-sm">
            Explore Open Drives <ArrowRight size={14} />
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Tabs
            tabs={statusTabs}
            activeTab={filterStatus}
            onChange={(tabId) => {
              setFilterStatus(tabId);
              setCurrentPage(1);
            }}
            size="sm"
          />

          <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
            <input
              type="text"
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-xs)' }}
              aria-label="Filter my applications"
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
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={search || filterStatus !== 'all' ? 'No Matching Applications' : 'No Applications Submitted Yet'}
          description={
            search || filterStatus !== 'all'
              ? 'No applications match your active search and status filter.'
              : 'You have not submitted an application to any campus recruitment drives yet.'
          }
          actionText="Browse Open Drives"
          onAction={() => (window.location.href = '/drives')}
        />
      ) : (
        <div className="table-container">
          <table aria-label="Student placement applications table">
            <thead>
              <tr>
                <th scope="col">Company Partner</th>
                <th scope="col">Job Role</th>
                <th scope="col">Package (CTC)</th>
                <th scope="col">Applied Date</th>
                <th scope="col">Selection Stage</th>
                <th scope="col">Current Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.map((app) => {
                const drive = app.placementDriveId || {};
                const company = drive.companyId || {};
                const ctcFormatted = formatLPA(drive.salaryPackage?.ctc);

                return (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                        {company.name || 'Corporate Partner'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {company.industry || 'Technology'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                        {drive.jobRole || 'Campus Placement Drive'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--success)' }}>
                        {ctcFormatted}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(app.appliedDate)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--primary)',
                          backgroundColor: 'var(--primary-light)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                        }}
                      >
                        Round {app.currentRound}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link
                        to={`/drives/${drive._id}`}
                        className="btn btn-secondary btn-xs"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        Dossier <ExternalLink size={12} />
                      </Link>
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
    </div>
  );
};

export default ApplicationsPage;
