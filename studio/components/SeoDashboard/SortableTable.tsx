// Sortable + paginated table for the SEO dashboard.
//
// Sort state (sortKey, sortDir) is owned by the SECTION component so it
// can drive its own header counts and is consistent with the
// useSortableData hook pattern.
//
// Pagination state lives INSIDE this component because every section
// uses the same page size and the parent doesn't otherwise need to know
// which slice is visible. When the input row count changes (e.g., locale
// filter narrows the result set), the page is reset to 0.
//
// One source of truth for table styling (hairline, hover, header) so every
// section looks identical without each one re-importing the same styles.

import { useState, useEffect, type ReactNode } from 'react';
import { Card, Tooltip, Box, Text, Flex, Button } from '@sanity/ui';
import styled from 'styled-components';

export type Align = 'left' | 'right';
export type SortDir = 'asc' | 'desc';

export interface ColumnDef<T> {
  /** Property name on the row used both as the sort key and the React key. */
  key: keyof T & string;
  /** Header label, rendered as-is. */
  label: string;
  align: Align;
  /** True if the column's values should render with tabular-nums alignment. */
  numeric: boolean;
  /** First-click direction when this column is freshly selected for sort. */
  defaultSort: SortDir;
  /** Cell renderer. Defaults to String(row[key]) if not provided. */
  render?: (row: T) => ReactNode;
  /** Plain-language definition shown on hover over the column header. */
  tooltip?: string;
}

interface Props<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  sortKey: string;
  sortDir: SortDir;
  onSort: (col: ColumnDef<T>) => void;
  rowKey: (row: T, index: number) => string;
  /** Rows per page. Omit (or pass undefined / 0) to disable pagination. */
  pageSize?: number;
  /** Message shown in place of rows when there are none. */
  emptyMessage?: string;
}

// Semi-transparent grays — read OK in both light and dark Studio themes.
const HAIRLINE = 'rgba(127, 127, 127, 0.18)';
const ROW_HOVER = 'rgba(127, 127, 127, 0.07)';

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
`;

const HeaderCell = styled.th<{ $align: Align; $active: boolean }>`
  padding: 0.8rem 1rem;
  text-align: ${(p) => p.$align};
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: ${(p) => (p.$active ? 1 : 0.65)};
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid ${HAIRLINE};
  transition: opacity 0.12s ease;
  &:hover { opacity: 1; }
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
    opacity: 1;
  }
  @media (max-width: 600px) {
    padding: 0.7rem 0.6rem;
  }
`;

const HeaderLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0;
`;

const HeaderInfo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 1px solid currentColor;
  margin-left: 0.4rem;
  font-family: ui-serif, Georgia, serif;
  font-size: 9px;
  font-weight: 700;
  font-style: italic;
  opacity: 0.55;
  line-height: 1;
  cursor: help;
  &:hover { opacity: 1; }
`;

const TooltipContent = styled(Box)`
  max-width: 280px;
`;

const BodyRow = styled.tr`
  transition: background-color 0.12s ease;
  &:hover { background-color: ${ROW_HOVER}; }
`;

const BodyCell = styled.td<{ $align: Align; $numeric: boolean }>`
  padding: 0.625rem 1rem;
  text-align: ${(p) => p.$align};
  font-size: 0.875rem;
  font-variant-numeric: ${(p) => (p.$numeric ? 'tabular-nums' : 'normal')};
  border-bottom: 1px solid ${HAIRLINE};
  vertical-align: middle;
  @media (max-width: 600px) {
    padding: 0.55rem 0.6rem;
    font-size: 0.8rem;
  }
`;

const PagerRow = styled(Flex)`
  border-top: 1px solid ${HAIRLINE};
  padding: 0.75rem 1rem;
`;

function indicator(active: boolean, sortDir: SortDir): string {
  if (!active) return '';
  return sortDir === 'desc' ? ' ↓' : ' ↑';
}

export function SortableTable<T>({
  rows,
  columns,
  sortKey,
  sortDir,
  onSort,
  rowKey,
  pageSize,
  emptyMessage = 'No data for this period yet.',
}: Props<T>) {
  const paginate = Boolean(pageSize && pageSize > 0);
  const [currentPage, setCurrentPage] = useState(0);

  // Reset to first page whenever the input row count changes (filter toggled, etc.).
  useEffect(() => {
    setCurrentPage(0);
  }, [rows.length]);

  const totalPages = paginate ? Math.max(1, Math.ceil(rows.length / (pageSize as number))) : 1;
  const safePage = Math.min(currentPage, totalPages - 1);
  const start = paginate ? safePage * (pageSize as number) : 0;
  const end = paginate ? Math.min(start + (pageSize as number), rows.length) : rows.length;
  const visibleRows = paginate ? rows.slice(start, end) : rows;
  const showPager = paginate && totalPages > 1;

  return (
    <Card padding={0} radius={3} shadow={1} style={{ overflow: 'hidden' }}>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              {columns.map((col) => {
                const active = sortKey === col.key;
                const ariaSort = active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
                return (
                  <HeaderCell
                    key={col.key}
                    $align={col.align}
                    $active={active}
                    onClick={() => onSort(col)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSort(col);
                      }
                    }}
                    tabIndex={0}
                    role="columnheader"
                    aria-sort={ariaSort}
                    scope="col"
                  >
                    <HeaderLabel>
                      {col.label}
                      {indicator(active, sortDir)}
                      {col.tooltip ? (
                        <Tooltip
                          content={
                            <TooltipContent padding={3}>
                              <Text size={1} style={{ lineHeight: 1.5 }}>
                                {col.tooltip}
                              </Text>
                            </TooltipContent>
                          }
                          placement="top"
                          portal
                          fallbackPlacements={['bottom', 'right', 'left']}
                        >
                          <HeaderInfo
                            aria-label={`Definition of ${col.label}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            i
                          </HeaderInfo>
                        </Tooltip>
                      ) : null}
                    </HeaderLabel>
                  </HeaderCell>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <BodyRow>
                <BodyCell
                  $align="left"
                  $numeric={false}
                  colSpan={columns.length}
                  style={{ textAlign: 'center', opacity: 0.6, padding: '1.75rem 1rem' }}
                >
                  {emptyMessage}
                </BodyCell>
              </BodyRow>
            ) : (
              visibleRows.map((row, i) => (
                <BodyRow key={rowKey(row, start + i)}>
                  {columns.map((col) => (
                    <BodyCell key={col.key} $align={col.align} $numeric={col.numeric}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </BodyCell>
                  ))}
                </BodyRow>
              ))
            )}
          </tbody>
        </Table>
      </TableWrap>

      {showPager ? (
        <PagerRow justify="space-between" align="center" gap={3} wrap="wrap">
          <Text size={1} muted style={{ fontVariantNumeric: 'tabular-nums' }}>
            Showing {start + 1}–{end} of {rows.length}
          </Text>
          <Flex gap={2} align="center">
            <Text size={1} muted style={{ fontVariantNumeric: 'tabular-nums' }}>
              Page {safePage + 1} of {totalPages}
            </Text>
            <Button
              text="← Prev"
              mode="ghost"
              fontSize={1}
              padding={2}
              disabled={safePage <= 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            />
            <Button
              text="Next →"
              mode="ghost"
              fontSize={1}
              padding={2}
              disabled={safePage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            />
          </Flex>
        </PagerRow>
      ) : null}
    </Card>
  );
}
