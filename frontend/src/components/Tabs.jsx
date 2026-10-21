import React from 'react';

const Tabs = ({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`tabs-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem',
        backgroundColor: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: size === 'sm' ? '0.35rem 0.65rem' : '0.5rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
              fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
              border: 'none',
              transition: 'all var(--duration-fast) var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <tab.icon size={15} aria-hidden="true" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'var(--border-default)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
