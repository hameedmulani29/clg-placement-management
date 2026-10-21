import React from 'react';
import { FolderSearch } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'There are no active records matching your criteria.',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-strong)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface-subtle)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          border: '1px solid var(--border-subtle)',
        }}
        aria-hidden="true"
      >
        <Icon size={26} />
      </div>
      <h3
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: '0.35rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          maxWidth: '420px',
          lineHeight: 1.5,
          marginBottom: actionText || secondaryActionText ? '1.5rem' : 0,
        }}
      >
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionText && onAction && (
            <button onClick={onAction} className="btn btn-primary btn-sm">
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button onClick={onSecondaryAction} className="btn btn-secondary btn-sm">
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
