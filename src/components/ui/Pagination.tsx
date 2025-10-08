import React from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, currentPage - 1);
  const next = Math.min(totalPages, currentPage + 1);

    return (
      <div className={className}>
        <div className="inline-flex rounded" style={{ boxShadow: '0 0px 5px rgba(37,99,235,0.14)' }}>
          <nav
            className="inline-flex items-center rounded bg-white overflow-hidden"
            aria-label="Pagination"
          >
          <button
            onClick={() => onPageChange(prev)}
            disabled={currentPage <= 1}
            className="w-12 h-12 flex items-center justify-center text-lg text-slate-600 border border-slate-100 bg-white rounded-l-md disabled:opacity-50"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-12 h-12 flex items-center justify-center text-lg ${isActive ? 'bg-white text-slate-900 font-semibold' : 'bg-white text-slate-600'} border-t border-b border-slate-100`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(next)}
            disabled={currentPage >= totalPages}
            className="w-12 h-12 flex items-center justify-center text-lg text-slate-600 border border-slate-100 bg-white rounded-r-md disabled:opacity-50"
          >
            &gt;
          </button>
          </nav>
        </div>
      </div>
    );
};

export default Pagination;
