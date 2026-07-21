import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortDirection } from '@/types/api';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  /** When set, the accessor field name sent to onSortChange (enables header sort). */
  sortField?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  sort?: { field: string; direction: SortDirection };
  onSortChange?: (field: string) => void;
  onRowClick?: (row: T) => void;
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

/** Generic, responsive table with header sorting, loading skeletons, and empty state. */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  skeletonRows = 6,
  emptyState,
  sort,
  onSortChange,
  onRowClick,
}: DataTableProps<T>) {
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => {
                const isSorted = sort && col.sortField && sort.field === col.sortField;
                const sortable = Boolean(col.sortField && onSortChange);
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                      alignClass[col.align ?? 'left'],
                      col.headerClassName,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => onSortChange?.(col.sortField as string)}
                        className={cn(
                          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
                          isSorted && 'text-foreground',
                        )}
                      >
                        {col.header}
                        {isSorted ? (
                          sort?.direction === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              rows.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-muted/40',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3.5 text-foreground',
                        alignClass[col.align ?? 'left'],
                        col.className,
                      )}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showEmpty && (
        <div className="px-4 py-12 text-center">
          {emptyState ?? <p className="text-sm text-muted-foreground">No records found.</p>}
        </div>
      )}
    </div>
  );
}
