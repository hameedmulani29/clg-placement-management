import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { Building2, Plus, Globe, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setFormData({ name: '', industry: '', website: '', contactEmail: '', contactPhone: '', description: '', address: '' });
        await fetchCompanies();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register company.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading partner corporate recruiters..." />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Partner Recruiting Companies</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Onboard corporate partners and manage campus recruitment relationships</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={16} /> Onboard Company
        </button>
      </div>

      <div className="grid-cols-2">
        {companies.map((comp) => (
          <div key={comp._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{comp.name}</h3>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6366f1' }}>{comp.industry}</span>
                  </div>
                </div>
                <span style={{ backgroundColor: comp.isActive ? '#ecfdf5' : '#fef2f2', color: comp.isActive ? '#059669' : '#dc2626', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
                  {comp.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {comp.description || 'Enterprise recruiting partner.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} color="#94a3b8" /> {comp.contactEmail}
                </div>
                {comp.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Globe size={14} color="#94a3b8" />
                    <a href={comp.website} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5' }}>
                      {comp.website}
                    </a>
                  </div>
                )}
                {comp.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="#94a3b8" /> {comp.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Company Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Corporate Partner">
        {formError && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Company Name *</label>
            <input type="text" required placeholder="e.g. Cisco Systems" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Industry Sector *</label>
              <input type="text" required placeholder="Cloud / Networking" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Website URL</label>
              <input type="url" placeholder="https://..." value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>HR / Contact Email *</label>
              <input type="email" required placeholder="hr@cisco.com" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Contact Phone</label>
              <input type="text" placeholder="+1-..." value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Company Overview</label>
            <textarea rows={2} placeholder="Brief summary of company focus..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Registering...' : 'Register Company'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCompaniesPage;
