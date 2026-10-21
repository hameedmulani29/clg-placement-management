import React from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  XCircle,
  PlayCircle,
  Archive,
  Ban,
  Check,
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase().trim();

  let badgeClass = 'badge-applied';
  let Icon = Clock;
  let label = norm.replace(/_/g, ' ');

  switch (norm) {
    case 'applied':
      badgeClass = 'badge-applied';
      Icon = Clock;
      break;
    case 'shortlisted':
      badgeClass = 'badge-shortlisted';
      Icon = Check;
      break;
    case 'interview_scheduled':
      badgeClass = 'badge-interview';
      Icon = Calendar;
      label = 'Interview Scheduled';
      break;
    case 'selected':
      badgeClass = 'badge-selected';
      Icon = Award;
      break;
    case 'rejected':
      badgeClass = 'badge-rejected';
      Icon = XCircle;
      break;
    case 'upcoming':
      badgeClass = 'badge-upcoming';
      Icon = Clock;
      break;
    case 'ongoing':
      badgeClass = 'badge-ongoing';
      Icon = PlayCircle;
      break;
    case 'completed':
      badgeClass = 'badge-completed';
      Icon = Archive;
      break;
    case 'cancelled':
      badgeClass = 'badge-cancelled';
      Icon = Ban;
      break;
    case 'active':
      badgeClass = 'badge-selected';
      Icon = CheckCircle2;
      break;
    case 'inactive':
      badgeClass = 'badge-rejected';
      Icon = XCircle;
      break;
    default:
      badgeClass = 'badge-applied';
      Icon = Clock;
      label = norm || 'Pending';
  }

  return (
    <span className={`badge ${badgeClass}`} title={`Status: ${label}`}>
      <Icon size={12} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
