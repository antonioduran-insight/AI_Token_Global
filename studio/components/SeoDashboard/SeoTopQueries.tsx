import { useState, useMemo } from 'react';
import { Stack, Flex, Badge } from '@sanity/ui';
import styled from 'styled-components';
import type { QueryRow, QueriesSnapshot } from './lib/types';
import { loadQueries } from './lib/loadSnapshot';
import { formatNumber, formatPercent, formatPosition } from './lib/formatters';
import { LocaleFilter, type LocaleFilterValue, filterByLocale, countByLocale } from './LocaleFilter';
import { SortableTable, type ColumnDef } from './SortableTable';
import { useSortableData } from './lib/useSortableData';
import { SectionHeader } from './SectionHeader';
import { TopQueriesBar } from './charts/TopQueriesBar';

const data: QueriesSnapshot = loadQueries();
const LOCALE_COUNTS = countByLocale(data.rows);

const QueryText = styled.span`
  font-weight: 500;
`;

const COLUMNS: ColumnDef<QueryRow>[] = [
  {
    key: 'query',
    label: 'Query',
    align: 'left',
    numeric: false,
    defaultSort: 'asc',
    render: (row) => <QueryText>{row.query}</QueryText>,
  },
  {
    key: 'locale',
    label: 'Locale',
    align: 'left',
    numeric: false,
    defaultSort: 'asc',
    render: (row) => (
      <Badge tone="default" fontSize={0}>
        {row.locale.toUpperCase()}
      </Badge>
    ),
  },
  {
    key: 'clicks',
    label: 'Clicks',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatNumber(row.clicks),
  },
  {
    key: 'impressions',
    label: 'Impressions',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatNumber(row.impressions),
  },
  {
    key: 'ctr',
    label: 'CTR',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatPercent(row.ctr, 2),
  },
  {
    key: 'position',
    label: 'Avg. position',
    align: 'right',
    numeric: true,
    defaultSort: 'asc',
    render: (row) => formatPosition(row.position),
  },
];

export function SeoTopQueries() {
  const [locale, setLocale] = useState<LocaleFilterValue>('all');
  const filteredRows = useMemo(() => filterByLocale(data.rows, locale), [locale]);
  const { sortKey, sortDir, sortedRows, toggleSort } = useSortableData(
    filteredRows,
    'clicks',
    COLUMNS,
  );

  return (
    <Stack space={4}>
      <SectionHeader
        title="Top Queries"
        rangeDays={data.meta.rangeDays}
        visibleCount={sortedRows.length}
        totalCount={data.rows.length}
        countNoun="queries"
      />
      <TopQueriesBar rows={data.rows} topN={10} />

      <Flex align="center" gap={3} wrap="wrap">
        <LocaleFilter value={locale} onChange={setLocale} counts={LOCALE_COUNTS} />
      </Flex>
      <SortableTable
        rows={sortedRows}
        columns={COLUMNS}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        rowKey={(row, i) => `${row.query}-${row.locale}-${i}`}
      />
    </Stack>
  );
}
