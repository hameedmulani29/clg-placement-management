import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const EligibilityBadge = ({ isEligible, reasons = [] }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className={`badge ${isEligible ? 'badge-eligible' : 'badge-ineligible'}`}
        style={{ cursor: reasons.length > 0 ? 'pointer' : 'default', border: 'none' }}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {isEligible ? (
          <>
            <CheckCircle2 size={13} /> ELIGIBLE
          </>
        ) : (
          <>
            <XCircle size={13} /> NOT ELIGIBLE
          </>
        )}
        {reasons.length > 0 && <Info size={12} style={{ marginLeft: 3 }} />}
      </button>

      {showTooltip && reasons.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            zIndex: 50,
            backgroundColor: '#1e293b',
            color: '#ffffff',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            width: '260px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: '#f87171' }}>Ineligibility Reasons:</div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, lineHeight: 1.4 }}>
            {reasons.map((r, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EligibilityBadge;
