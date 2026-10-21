import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
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
          maxWidth: '480px',
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
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '1px solid var(--border-default)',
          }}
          aria-hidden="true"
        >
          <FileQuestion size={32} />
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
          404 — Page Not Found
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          The requested placement drive, applicant dossier, or page URL does not exist or has been archived.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} /> Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
