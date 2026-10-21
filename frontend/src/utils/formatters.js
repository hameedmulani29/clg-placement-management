/**
 * Format currency CTC into LPA string (e.g. 1200000 -> "12.0 LPA")
 */
export const formatLPA = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
  const lpa = Number(amount) / 100000;
  return `${lpa.toFixed(1)} LPA`;
};

/**
 * Format standard readable date (e.g. "Oct 24, 2026")
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date & time (e.g. "Thu, Oct 24, 2:30 PM")
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format relative time (e.g. "2 hours ago", "yesterday")
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return formatDate(dateInput);
};
