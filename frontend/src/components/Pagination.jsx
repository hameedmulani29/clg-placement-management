import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalRecords,
  pageSize = 10,
  onPageChange,
}) => {
  if (totalPages <= 1 && !totalRecords) return null;

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords || currentPage * pageSize);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface-subtle)',
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
      }}
    >
      <div>
        {totalRecords ? (
          <span>
            Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of <strong>{totalRecords}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-secondary btn-xs"
          style={{ padding: '0.3rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          let pageNum = i + 1;
          if (totalPages > 5 && currentPage > 3) {
            pageNum = currentPage - 2 + i;
            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
          }

          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={isActive ? 'btn btn-primary btn-xs' : 'btn btn-secondary btn-xs'}
              style={{
                minWidth: '28px',
                padding: '0.3rem',
                fontWeight: isActive ? 'var(--font-weight-bold)' : 'normal',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary btn-xs"
          style={{ padding: '0.3rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
          aria-label="Next page"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
