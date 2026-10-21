import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Tabs from '../components/Tabs';
import { SkeletonCard } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { formatRelativeTime } from '../utils/formatters';
import {
  Bell,
  CheckCheck,
  Clock,
  Calendar,
  Award,
  FileCheck2,
  Info,
  Check,
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=60');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All caught up!', 'All notifications marked as read.');
    } catch (err) {
      toast.error('Error', 'Failed to mark all as read.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.isRead;
    return n.type === filterType;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'interview':
        return <Calendar size={18} style={{ color: 'var(--warning)' }} />;
      case 'result':
      case 'offer':
        return <Award size={18} style={{ color: 'var(--success)' }} />;
      case 'application':
        return <FileCheck2 size={18} style={{ color: 'var(--info)' }} />;
      default:
        return <Bell size={18} style={{ color: 'var(--primary)' }} />;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Alerts', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'interview', label: 'Interviews' },
    { id: 'application', label: 'Applications' },
  ];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <PageHeader
        title="Notification Center & Alerts"
        subtitle="Stay updated on recruitment announcements, shortlist calls, and confirmed job offers"
        breadcrumbs={[
          { label: 'Portal', to: '/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <CheckCheck size={16} /> Mark all as read
            </button>
          ) : null
        }
      />

      <div style={{ marginBottom: '1.75rem' }}>
        <Tabs tabs={tabs} activeTab={filterType} onChange={(id) => setFilterType(id)} size="sm" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SkeletonCard height="90px" />
          <SkeletonCard height="90px" />
          <SkeletonCard height="90px" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filterType === 'unread' ? 'All Caught Up!' : 'No Notifications'}
          description={
            filterType === 'unread'
              ? 'You have read all your notifications. New placement alerts will appear here.'
              : 'There are no notifications matching your selected filter.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: n.isRead ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                borderLeft: n.isRead ? '1px solid var(--border-default)' : '4px solid var(--primary)',
                boxShadow: n.isRead ? 'var(--shadow-xs)' : 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all var(--duration-fast)',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                  aria-hidden="true"
                >
                  {getNotificationIcon(n.type)}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: n.isRead ? 'var(--font-weight-semibold)' : 'var(--font-weight-bold)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span
                        style={{
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontSize: '0.65rem',
                          fontWeight: 'var(--font-weight-bold)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase',
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-xs)',
                      margin: '0.35rem 0',
                      lineHeight: 1.5,
                    }}
                  >
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    <Clock size={12} />
                    <span>{formatRelativeTime(n.createdAt)}</span>
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n._id)}
                  className="btn btn-secondary btn-xs"
                  style={{ flexShrink: 0 }}
                  title="Mark this notification as read"
                >
                  <Check size={13} /> Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
