
import React, { useState } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  onRowEdit?: (item: T) => void;
  rowClassName?: string;
  className?: string;
  showEditButton?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const Table = <T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  onRowEdit,
  rowClassName = "",
  className = "",
  showEditButton = false,
  pagination,
  onPageChange,
  onLimitChange
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Add edit column if needed
  const displayColumns = showEditButton && onRowEdit
    ? [...columns, { header: 'Actions', accessor: ((item: T) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRowEdit(item);
          }}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit trade"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )) as keyof T | ((item: T) => React.ReactNode) }]
    : columns;

  // Handle pagination
  const totalItems = pagination?.total || data.length;
  const totalPages = pagination?.totalPages || 1;
  const currentPageNum = pagination?.page || currentPage;
  const itemsPerPage = pagination?.limit || 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const handleLimitChange = (limit: number) => {
    setCurrentPage(1);
    onLimitChange?.(limit);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    const startItem = (currentPageNum - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPageNum * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-4 order-2 sm:order-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Show
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            per page
          </span>
        </div>
        
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <span className="text-[10px] font-bold text-slate-400">
            {startItem}-{endItem} of {totalItems}
          </span>
        </div>

        <div className="flex items-center gap-1 order-3">
          <button
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={currentPageNum === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPageNum === 1
                ? 'text-slate-200 cursor-not-allowed'
                : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
            }`}
            title="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPageNum <= 3) {
              pageNum = i + 1;
            } else if (currentPageNum >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPageNum - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-colors ${
                  currentPageNum === pageNum
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPageNum === totalPages
                ? 'text-slate-200 cursor-not-allowed'
                : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
            }`}
            title="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
              {displayColumns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-5 whitespace-nowrap font-black ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length} className="px-4 py-12 text-center text-slate-400 font-bold italic">
                  No data available in this view.
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    hover:bg-slate-50 transition-colors border-b border-slate-50 group
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${rowClassName}
                  `}
                >
                  {displayColumns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-4 ${col.className || ''}`}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default Table;
