import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onSort?: (key: string) => void;
  rowKey: (item: T) => string;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display in this list.',
  onSort,
  rowKey,
}: TableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && onSort && (
                      <button
                        onClick={() => onSort(col.key)}
                        className="p-1 hover:bg-slate-200 rounded transition"
                        aria-label={`Sort by ${col.header}`}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={rowKey(item)} className="hover:bg-slate-50/80 transition">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 font-medium">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
