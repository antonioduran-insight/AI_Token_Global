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
import { GLOSSARY } from './lib/glossary';

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
    tooltip: GLOSSARY.query,
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
    tooltip: GLOSSARY.locale,
  },
  {
    key: 'clicks',
    label: 'Clicks',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatNumber(row.clicks),
    tooltip: GLOSSARY.clicks,
  },
  {
    key: 'impressions',
    label: 'Impressions',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatNumber(row.impressions),
    tooltip: GLOSSARY.impressions,
  },
  {
    key: 'ctr',
    label: 'CTR',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatPercent(row.ctr, 2),
    tooltip: GLOSSARY.ctr,
  },
  {
    key: 'position',
    label: 'Avg. position',
    align: 'right',
    numeric: true,
    defaultSort: 'asc',
    render: (row) => formatPosition(row.position),
    tooltip: GLOSSARY.avgPosition,
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
        subtitle="The search terms people typed into Google before clicking through to your site. Use this to discover what your audience is actively searching for — then check whether you have content that matches."
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
        pageSize={10}
      />
    </Stack>
  );
}
