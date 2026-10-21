import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Destructive Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDestructive ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isDestructive ? 'var(--danger-light)' : 'var(--warning-light)',
            color: isDestructive ? 'var(--danger)' : 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isDestructive ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
