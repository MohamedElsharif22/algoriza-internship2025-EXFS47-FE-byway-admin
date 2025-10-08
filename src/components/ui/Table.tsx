import { ReactNode } from 'react';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  pagination?: PaginationProps;
}

const Table = <T extends { id: number | string }>({ 
  columns, 
  data, 
  loading,
  onRowClick,
  pagination 
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={clsx(
                  'hover:bg-gray-50',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={`${item.id}-${column.key}`}
                    className={clsx(
                      'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                    Showing {(pagination.pageIndex - 1) * pagination.pageSize + 1} to{' '}
                    {Math.min(pagination.pageIndex * pagination.pageSize, data.length)} of{' '}
                    {pagination.totalPages ? pagination.totalPages * pagination.pageSize : data.length} results
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                disabled={pagination.pageIndex === 1}
                className={clsx(
                  'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50',
                  pagination.pageIndex === 1 && 'opacity-50 cursor-not-allowed'
                )}
              >
                Previous
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                disabled={!pagination.totalPages || pagination.pageIndex === pagination.totalPages}
                className={clsx(
                  'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50',
                  (!pagination.totalPages || pagination.pageIndex === pagination.totalPages) && 'opacity-50 cursor-not-allowed'
                )}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;