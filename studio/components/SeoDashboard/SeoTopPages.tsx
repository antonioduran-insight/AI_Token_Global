import { useState, useMemo } from 'react';
import { Stack, Flex, Badge } from '@sanity/ui';
import styled from 'styled-components';
import type { PageRow, PagesSnapshot } from './lib/types';
import { loadPages } from './lib/loadSnapshot';
import { formatNumber, formatPercent, formatPosition } from './lib/formatters';
import { LocaleFilter, type LocaleFilterValue, filterByLocale, countByLocale } from './LocaleFilter';
import { SortableTable, type ColumnDef } from './SortableTable';
import { useSortableData } from './lib/useSortableData';
import { SectionHeader } from './SectionHeader';
import { GLOSSARY } from './lib/glossary';

const data: PagesSnapshot = loadPages();
const LOCALE_COUNTS = countByLocale(data.rows);

const PathText = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.825rem;
  font-weight: 500;
  word-break: break-word;
`;

const COLUMNS: ColumnDef<PageRow>[] = [
  {
    key: 'page',
    label: 'Page',
    align: 'left',
    numeric: false,
    defaultSort: 'asc',
    render: (row) => <PathText>{row.page}</PathText>,
    tooltip: GLOSSARY.page,
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

export function SeoTopPages() {
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
        title="Top Pages"
        subtitle="URLs on your site, ranked by how much search traffic each one brings in. Pairs with Top Queries: that section asks 'what people want,' this one asks 'what we already have.' Use this to decide which pages to refresh first."
        rangeDays={data.meta.rangeDays}
        visibleCount={sortedRows.length}
        totalCount={data.rows.length}
        countNoun="pages"
      />
      <Flex align="center" gap={3} wrap="wrap">
        <LocaleFilter value={locale} onChange={setLocale} counts={LOCALE_COUNTS} />
      </Flex>
      <SortableTable
        rows={sortedRows}
        columns={COLUMNS}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        rowKey={(row, i) => `${row.page}-${i}`}
        pageSize={10}
      />
    </Stack>
  );
}
