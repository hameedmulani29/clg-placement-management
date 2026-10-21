import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

const FileDropzone = ({
  selectedFile,
  onFileSelect,
  onFileRemove,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 5,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndSelect = (file) => {
    setDragError('');
    if (!file) return;

    // Check size limit
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setDragError(`File exceeds maximum size limit of ${maxSizeMB}MB.`);
      return;
    }

    // Check extension
    const validExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
    const fileExt = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!validExtensions.includes(fileExt)) {
      setDragError(`Invalid file format. Allowed formats: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            validateAndSelect(e.target.files[0]);
          }
        }}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Upload resume document dropzone. Drag and drop file or click to browse."
          style={{
            border: `2px dashed ${isDragOver ? 'var(--primary)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isDragOver ? 'var(--primary-light)' : 'var(--bg-surface-subtle)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all var(--duration-fast) var(--ease-out)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface)',
              color: isDragOver ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
              boxShadow: 'var(--shadow-xs)',
              border: '1px solid var(--border-default)',
            }}
          >
            <UploadCloud size={24} />
          </div>

          <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
            Click to upload or drag & drop resume
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Supported formats: PDF, DOCX (Max: {maxSizeMB}MB)
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedFile.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {formatFileSize(selectedFile.size)} • Ready for S3 upload
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onFileRemove}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
            aria-label="Remove selected file"
            disabled={disabled}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {dragError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--danger)',
            fontSize: 'var(--text-xs)',
            marginTop: '0.5rem',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          <AlertCircle size={14} />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
