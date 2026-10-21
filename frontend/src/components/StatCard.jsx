import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'var(--primary)',
  bgColor = 'var(--primary-light)',
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: bgColor,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(0, 0, 0, 0.04)',
          }}
          aria-hidden="true"
        >
          <Icon size={24} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            fontWeight: 'var(--font-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{title}</span>
          {trend && (
            <span
              style={{
                fontSize: '0.72rem',
                color: trend.positive ? 'var(--success)' : 'var(--danger)',
                fontWeight: 'var(--font-weight-bold)',
                backgroundColor: trend.positive ? 'var(--success-light)' : 'var(--danger-light)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {trend.label}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '1.75rem',
            fontFamily: 'var(--font-family-display)',
            fontWeight: 'var(--font-weight-extrabold)',
            color: 'var(--text-primary)',
            margin: '0.15rem 0',
            lineHeight: 1.15,
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
