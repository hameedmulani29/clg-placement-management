import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch (s?.toLowerCase()) {
      case 'applied':
        return 'badge-applied';
      case 'shortlisted':
        return 'badge-shortlisted';
      case 'interview_scheduled':
        return 'badge-interview';
      case 'selected':
        return 'badge-selected';
      case 'rejected':
        return 'badge-rejected';
      case 'upcoming':
        return 'badge-shortlisted';
      case 'ongoing':
        return 'badge-selected';
      case 'completed':
        return 'badge-applied';
      case 'cancelled':
        return 'badge-rejected';
      default:
        return 'badge-applied';
    }
  };

  const formatText = (s) => {
    if (!s) return 'UNKNOWN';
    return s.replace(/_/g, ' ');
  };

  return <span className={`badge ${getBadgeClass(status)}`}>{formatText(status)}</span>;
};

export default StatusBadge;
