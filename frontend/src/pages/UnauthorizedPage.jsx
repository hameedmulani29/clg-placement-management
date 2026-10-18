import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShieldX size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          403 - Access Denied
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          You do not have the required role privileges or administrative authorization to access this cloud resource.
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Portal
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
