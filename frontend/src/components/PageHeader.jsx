import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  children,
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Breadcrumb row */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" style={{ marginBottom: '0.65rem' }}>
          <ol
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
            }}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {idx > 0 && (
                    <ChevronRight size={13} style={{ color: 'var(--text-subtle)' }} aria-hidden="true" />
                  )}
                  {isLast || !crumb.to ? (
                    <span
                      aria-current={isLast ? 'page' : undefined}
                      style={{
                        fontWeight: isLast ? 'var(--font-weight-semibold)' : 'inherit',
                        color: isLast ? 'var(--text-primary)' : 'inherit',
                      }}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.to}
                      style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                      }}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Main Title and Action Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.75rem',
                fontFamily: 'var(--font-family-display)',
                fontWeight: 'var(--font-weight-extrabold)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                marginTop: '0.35rem',
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {children && <div style={{ marginTop: '1.25rem' }}>{children}</div>}
    </div>
  );
};

export default PageHeader;
