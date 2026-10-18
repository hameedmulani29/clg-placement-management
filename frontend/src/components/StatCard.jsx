import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#4f46e5', bgColor = '#eef2ff' }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '12px',
          backgroundColor: bgColor,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
