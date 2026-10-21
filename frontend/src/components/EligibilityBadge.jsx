import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const EligibilityBadge = ({ isEligible, reasons = [] }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setShowTooltip(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showTooltip) {
        setShowTooltip(false);
        triggerRef.current?.focus();
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip]);

  const hasReasons = reasons && reasons.length > 0;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        className={`badge ${isEligible ? 'badge-eligible' : 'badge-ineligible'}`}
        style={{
          cursor: hasReasons ? 'pointer' : 'default',
          border: '1px solid transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
        onClick={() => hasReasons && setShowTooltip(!showTooltip)}
        aria-expanded={hasReasons ? showTooltip : undefined}
        aria-haspopup={hasReasons ? 'true' : undefined}
        title={hasReasons ? 'Click to inspect eligibility breakdown' : undefined}
      >
        {isEligible ? (
          <>
            <CheckCircle2 size={13} aria-hidden="true" />
            <span>Eligible</span>
          </>
        ) : (
          <>
            <XCircle size={13} aria-hidden="true" />
            <span>Not Eligible</span>
          </>
        )}
        {hasReasons && <AlertCircle size={12} style={{ opacity: 0.8 }} aria-hidden="true" />}
      </button>

      {showTooltip && hasReasons && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            width: '280px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-default)',
            animation: 'popover-in 0.15s var(--ease-out)',
          }}
        >
          <div
            style={{
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '0.4rem',
              color: isEligible ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {isEligible ? 'Eligibility Criteria Met' : 'Eligibility Disqualification'}
          </div>
          <ul style={{ paddingLeft: '1.1rem', margin: 0, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {reasons.map((r, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes popover-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default EligibilityBadge;
