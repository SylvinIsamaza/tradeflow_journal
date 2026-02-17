
import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  rowClassName?: string;
  className?: string;
}

const Table = <T extends { id?: string | number }>({ 
  columns, 
  data, 
  onRowClick, 
  rowClassName = "", 
  className = "" 
}: TableProps<T>) => {
  return (
    <div className={`overflow-x-auto custom-scrollbar ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
            {columns.map((col, idx) => (
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
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 font-bold italic">
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
                {columns.map((col, colIdx) => (
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
  );
};

export default Table;
