import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EligibilityBadge from '../components/EligibilityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, Briefcase, MapPin, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

const DrivesListPage = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchDrives();
  }, [department, status]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDrives();
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Placement Drives Catalog</h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Explore verified campus recruitment opportunities and verify eligibility</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <input
              type="text"
              placeholder="Search by role, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Filter Drives
          </button>
        </form>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner message="Evaluating eligibility across placement drives..." />
      ) : drives.length === 0 ? (
        <EmptyState
          title="No Placement Drives Found"
          description="There are currently no placement drives matching your search criteria."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setDepartment('');
            setStatus('');
          }}
        />
      ) : (
        <div className="grid-cols-2" style={{ alignItems: 'stretch' }}>
          {drives.map((drive) => {
            const ctcLpa = (drive.salaryPackage?.ctc / 100000).toFixed(2);
            return (
              <div key={drive._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
                        {drive.companyId?.industry || 'Enterprise'}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                        {drive.jobRole}
                      </h3>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                        {drive.companyId?.name}
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={drive.status} />
                    </div>
                  </div>

                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {drive.jobDescription}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700 }}>
                      <DollarSign size={16} /> {ctcLpa} LPA
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                      <MapPin size={15} /> {drive.jobLocations?.slice(0, 2).join(', ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                      <Calendar size={15} /> Deadline: {new Date(drive.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div>
                    {drive.hasApplied ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#059669', fontSize: '0.82rem', fontWeight: 700 }}>
                        <CheckCircle2 size={16} /> Applied
                      </span>
                    ) : drive.eligibility ? (
                      <EligibilityBadge
                        isEligible={drive.eligibility.isEligible}
                        reasons={drive.eligibility.reasons}
                      />
                    ) : null}
                  </div>

                  <Link to={`/drives/${drive._id}`} className="btn btn-primary btn-sm">
                    View & Apply →
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
