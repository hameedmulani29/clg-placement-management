import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import {
  Building2,
  Plus,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Briefcase,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

const AdminCompaniesPage = () => {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
    address: '',
  });

  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      if (res.data.success) {
        setCompanies(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await api.post('/companies', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          industry: '',
          website: '',
          contactEmail: '',
          contactPhone: '',
          description: '',
          address: '',
        });
        toast.success('Company Onboarded!', `${formData.name} is now registered as an active hiring partner.`);
        await fetchCompanies();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register company.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    if (!debouncedSearch.trim()) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.contactEmail && c.contactEmail.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredCompanies.length / pageSize) || 1;
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <PageHeader
        title="Top 50 Corporate Recruiting Partners"
        subtitle="Explore top 50 corporate hiring partners (10 companies per page), review campus recruitment history, and manage enterprise partnerships"
        badge={
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--primary)',
              backgroundColor: 'var(--primary-light)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-default)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Building2 size={13} /> {companies.length} Registered Enterprise Partners
          </span>
        }
        breadcrumbs={[
          { label: 'Portal' },
          { label: 'Corporate Partners' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={15} /> Onboard Company
          </button>
        }
      />

      {/* Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by company name, industry sector..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-xs)' }}
              aria-label="Search corporate partners"
            />
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50)',
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
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description={
            search
              ? 'No corporate partners match your active search query.'
              : 'There are no recruiting partners currently registered in the system.'
          }
          actionText="Onboard New Company"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <>
          <div className="grid-cols-2" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
          {paginatedCompanies.map((comp) => (
            <div
              key={comp._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: 'var(--text-md)',
                          fontWeight: 'var(--font-weight-extrabold)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {comp.name}
                      </h3>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--primary)',
                        }}
                      >
                        {comp.industry}
                      </span>
                    </div>
                  </div>

                  <span
                    className={comp.isActive ? 'badge badge-selected' : 'badge badge-rejected'}
                  >
                    {comp.isActive ? 'Active Partner' : 'Inactive'}
                  </span>
                </div>

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
                  {comp.description || 'Enterprise campus recruitment partner.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-primary)' }}>{comp.contactEmail}</span>
                  </div>
                  {comp.contactPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{comp.contactPhone}</span>
                    </div>
                  )}
                  {comp.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        {comp.website.replace('https://', '').replace('http://', '')} <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                  {comp.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{comp.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredCompanies.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
        </>
      )}

      {/* Onboard Company Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard New Corporate Recruiting Partner"
        subtitle="Register enterprise organization details for campus placement drives"
        maxWidth="560px"
      >
        {formError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              fontSize: 'var(--text-xs)',
              marginBottom: '1rem',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="comp-name" className="form-label">
              Company Name <span className="required">*</span>
            </label>
            <input
              id="comp-name"
              type="text"
              required
              placeholder="e.g. Cisco Systems"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label htmlFor="comp-industry" className="form-label">
                Industry Sector <span className="required">*</span>
              </label>
              <input
                id="comp-industry"
                type="text"
                required
                placeholder="Cloud Infrastructure & Networking"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="comp-website" className="form-label">
                Corporate Website URL
              </label>
              <input
                id="comp-website"
                type="url"
                placeholder="https://www.company.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label htmlFor="comp-email" className="form-label">
                Recruitment Contact Email <span className="required">*</span>
              </label>
              <input
                id="comp-email"
                type="email"
                required
                placeholder="university-recruiting@company.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="comp-phone" className="form-label">
                Contact Phone
              </label>
              <input
                id="comp-phone"
                type="tel"
                placeholder="+1 800 553 6387"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comp-address" className="form-label">
              Corporate Headquarters Address
            </label>
            <input
              id="comp-address"
              type="text"
              placeholder="San Jose, CA / Bangalore Campus"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comp-desc" className="form-label">
              Organization Description
            </label>
            <textarea
              id="comp-desc"
              rows={2}
              placeholder="Brief overview of hiring profile and domains..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Company Partner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCompaniesPage;
