import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getTargetUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'recruiter') return '/recruiter';
    return '/dashboard';
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '500px',
          textAlign: 'center',
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '1px solid var(--danger-border)',
          }}
          aria-hidden="true"
        >
          <ShieldAlert size={32} />
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 'var(--font-weight-extrabold)',
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          403 — Access Restricted
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          You do not have the necessary role privileges or cryptographic authorization to view this cloud placement resource.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} /> Home
          </Link>
          <Link to={getTargetUrl()} className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Your Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
