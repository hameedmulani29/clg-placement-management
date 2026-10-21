import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading placement data...', size = 32 }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <Loader2
        size={size}
        style={{
          color: 'var(--primary)',
          animation: 'spin 0.9s linear infinite',
        }}
        aria-hidden="true"
      />
      {message && (
        <p
          style={{
            marginTop: '1rem',
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {message}
        </p>
      )}
      <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
        {message}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const SkeletonLine = ({ width = '100%', height = '1rem', borderRadius = 'var(--radius-sm)' }) => {
  return <div className="skeleton" style={{ width, height, borderRadius }} />;
};

export const SkeletonStatGrid = ({ count = 4 }) => {
  return (
    <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '45%', height: '0.75rem', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ width: '70%', height: '1.5rem', marginBottom: '0.4rem' }} />
            <div className="skeleton" style={{ width: '55%', height: '0.65rem' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="skeleton" style={{ height: '0.85rem', width: '60%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div className="skeleton" style={{ height: '0.9rem', width: c === 0 ? '75%' : '50%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SkeletonCard = ({ height = '180px' }) => {
  return (
    <div className="card skeleton-card" style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="skeleton" style={{ width: '40%', height: '1rem', marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ width: '75%', height: '1.35rem', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: '90%', height: '0.85rem', marginBottom: '0.5rem' }} />
      </div>
      <div className="skeleton" style={{ width: '30%', height: '1.75rem' }} />
    </div>
  );
};

export default LoadingSpinner;
