import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EligibilityBadge from '../components/EligibilityBadge';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { SkeletonCard } from '../components/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { formatLPA, formatDate } from '../utils/formatters';
import {
  Search,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Filter,
  X,
  Building2,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

const DrivesListPage = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchDrives();
  }, [debouncedSearch, department, status]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (department) params.append('department', department);
      if (status) params.append('status', status);

      const res = await api.get(`/drives?${params.toString()}`);
      if (res.data.success) {
        setDrives(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch placement drives:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setStatus('');
    setOnlyEligible(false);
  };

  const hasActiveFilters = search || department || status || onlyEligible;

  // Filter for only eligible client-side if toggled
  const displayedDrives = onlyEligible
    ? drives.filter((d) => d.eligibility?.isEligible)
    : drives;

  return (
    <div>
      <PageHeader
        title="Campus Placement Drives Catalog"
        subtitle="Explore active on-campus recruitment drives, inspect real-time eligibility criteria, and submit applications"
        breadcrumbs={[
          { label: 'Portal', to: '/dashboard' },
          { label: 'Placement Drives' },
        ]}
        actions={
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {displayedDrives.length} drives available
          </span>
        }
      />

      {/* Discovery & Search Bar Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input with Debounce */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <input
              type="text"
              placeholder="Search by role, company, or job description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
              aria-label="Search placement drives"
            />
            <Search
              size={17}
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
                aria-label="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div style={{ flex: '1 1 200px' }}>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
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

          {/* Drive Status Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by drive status"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Quick Eligible Filter Toggle */}
          <button
            type="button"
            onClick={() => setOnlyEligible(!onlyEligible)}
            className={`btn btn-sm ${onlyEligible ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <CheckCircle2 size={14} />
            <span>Eligible Only</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--font-weight-semibold)' }}>Active Filters:</span>
            {search && (
              <span className="badge badge-applied" style={{ textTransform: 'none' }}>
                Query: "{search}"
              </span>
            )}
            {department && (
              <span className="badge badge-applied" style={{ textTransform: 'none' }}>
                Branch: {department}
              </span>
            )}
            {status && (
              <span className="badge badge-applied" style={{ textTransform: 'none' }}>
                Status: {status}
              </span>
            )}
            {onlyEligible && (
              <span className="badge badge-eligible" style={{ textTransform: 'none' }}>
                Eligible Only
              </span>
            )}
          </div>
        )}
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
          <SkeletonCard height="240px" />
          <SkeletonCard height="240px" />
          <SkeletonCard height="240px" />
          <SkeletonCard height="240px" />
        </div>
      ) : displayedDrives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Placement Drives Found"
          description={
            hasActiveFilters
              ? 'No placement drives match your active search and filter constraints.'
              : 'There are currently no active placement drives scheduled on campus.'
          }
          actionText={hasActiveFilters ? 'Reset All Filters' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="grid-cols-2" style={{ alignItems: 'stretch', gap: '1.5rem' }}>
          {displayedDrives.map((drive) => {
            const ctcFormatted = formatLPA(drive.salaryPackage?.ctc);
            const isDeadlinePassed = new Date(drive.applicationDeadline) < new Date();

            return (
              <div
                key={drive._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                }}
              >
                <div>
                  {/* Company & Status Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Building2 size={13} /> {drive.companyId?.industry || 'Enterprise Recruitment'}
                      </div>
                      <h3
                        style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--font-weight-extrabold)',
                          color: 'var(--text-primary)',
                          margin: '0.25rem 0 0.15rem',
                        }}
                      >
                        {drive.jobRole}
                      </h3>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>
                        {drive.companyId?.name}
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={drive.status} />
                    </div>
                  </div>

                  {/* Job Description preview */}
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-xs)',
                      lineHeight: 1.55,
                      marginBottom: '1.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {drive.jobDescription}
                  </p>

                  {/* Metadata Chips Bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.85rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1.25rem',
                      fontSize: 'var(--text-xs)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontWeight: 'var(--font-weight-extrabold)' }}>
                      <DollarSign size={15} /> {ctcFormatted}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={14} style={{ color: 'var(--text-muted)' }} /> {drive.jobLocations?.slice(0, 2).join(', ')}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: isDeadlinePassed ? 'var(--danger)' : 'var(--text-secondary)',
                        fontWeight: isDeadlinePassed ? 'var(--font-weight-bold)' : 'normal',
                      }}
                    >
                      <Clock size={14} style={{ color: isDeadlinePassed ? 'var(--danger)' : 'var(--text-muted)' }} />
                      <span>Deadline: {formatDate(drive.applicationDeadline)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action & Eligibility */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-default)',
                    paddingTop: '1rem',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    {drive.hasApplied ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--success-text)',
                          backgroundColor: 'var(--success-light)',
                          border: '1px solid var(--success-border)',
                          padding: '0.2rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 'var(--font-weight-bold)',
                        }}
                      >
                        <CheckCircle2 size={13} /> Already Applied
                      </span>
                    ) : drive.eligibility ? (
                      <EligibilityBadge
                        isEligible={drive.eligibility.isEligible}
                        reasons={drive.eligibility.reasons}
                      />
                    ) : null}
                  </div>

                  <Link to={`/drives/${drive._id}`} className="btn btn-primary btn-sm">
                    View Dossier & Apply <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DrivesListPage;
