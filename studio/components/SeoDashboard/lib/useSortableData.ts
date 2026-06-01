// Sort state + computation hook shared by every section that renders a
// sortable data table (Top Queries, Top Pages, Striking Distance, CTR Outliers).
//
// Why a hook (and not just a generic component): the SECTION needs to know
// how many rows are visible to render its "X of Y" count, so filter+sort
// state lives at the section level. The hook just encapsulates the sort
// piece so each section doesn't reinvent it.
//
// Usage:
//   const filtered = filterByLocale(data.rows, locale);
//   const { sortKey, sortDir, sortedRows, toggleSort } =
//     useSortableData(filtered, 'clicks', COLUMNS);

import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortableColumnLike {
  key: string;
  defaultSort: SortDir;
}

/**
 * Wraps a list of rows in sort state. The caller passes already-filtered rows
 * (so locale filtering remains a section-level concern). Returns sorted rows
 * plus the controls a table header needs to render sort indicators and react
 * to clicks.
 */
export function useSortableData<T extends Record<string, unknown>>(
  rows: T[],
  initialSortKey: keyof T & string,
  columns: SortableColumnLike[],
) {
  const initialCol = columns.find((c) => c.key === initialSortKey);
  const [sortKey, setSortKey] = useState<string>(initialSortKey as string);
  const [sortDir, setSortDir] = useState<SortDir>(initialCol?.defaultSort ?? 'desc');

  const sortedRows = useMemo(() => {
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [rows, sortKey, sortDir]);

  function toggleSort(col: SortableColumnLike) {
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      // First click on a fresh column uses the column's natural direction:
      // numeric columns default to descending (biggest first), text to ascending.
      setSortDir(col.defaultSort);
    }
  }

  return { sortKey, sortDir, sortedRows, toggleSort };
}
