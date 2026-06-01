import { useState, useMemo } from 'react';
import { Stack, Flex, Badge } from '@sanity/ui';
import styled from 'styled-components';
import type { CloudflarePageRow, CloudflarePagesSnapshot } from './lib/types';
import { loadCloudflarePages } from './lib/loadSnapshot';
import { formatNumber } from './lib/formatters';
import {
  LocaleFilter,
  type LocaleFilterValue,
  filterByLocale,
  countByLocale,
} from './LocaleFilter';
import { SortableTable, type ColumnDef } from './SortableTable';
import { useSortableData } from './lib/useSortableData';
import { SectionHeader } from './SectionHeader';

const data: CloudflarePagesSnapshot = loadCloudflarePages();
const LOCALE_COUNTS = countByLocale(data.rows);

const PathText = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.825rem;
  font-weight: 500;
  word-break: break-word;
`;

const COLUMNS: ColumnDef<CloudflarePageRow>[] = [
  {
    key: 'page',
    label: 'Page',
    align: 'left',
    numeric: false,
    defaultSort: 'asc',
    render: (r) => <PathText>{r.page}</PathText>,
    tooltip: 'Page path on the site, including the locale segment.',
  },
  {
    key: 'locale',
    label: 'Locale',
    align: 'left',
    numeric: false,
    defaultSort: 'asc',
    render: (r) => (
      <Badge tone="default" fontSize={0}>
        {r.locale.toUpperCase()}
      </Badge>
    ),
    tooltip: 'Language segment of the path (/en, /es, /id).',
  },
  {
    key: 'visits',
    label: 'Visits',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (r) => formatNumber(r.visits),
    tooltip: 'Cloudflare visits — counts every visitor, including ad-blocked / consent-declined ones GA4 misses.',
  },
  {
    key: 'pageViews',
    label: 'Page views',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (r) => formatNumber(r.pageViews),
    tooltip: 'Total page views for this page.',
  },
];

export function SeoCfTopPages() {
  const [locale, setLocale] = useState<LocaleFilterValue>('all');
  const filteredRows = useMemo(() => filterByLocale(data.rows, locale), [locale]);
  const { sortKey, sortDir, sortedRows, toggleSort } = useSortableData(
    filteredRows,
    'visits',
    COLUMNS,
  );

  return (
    <Stack space={4}>
      <SectionHeader
        title="Top Pages"
        subtitle="Pages ranked by Cloudflare visits. Because Cloudflare counts everyone, compare these against GA4 Top Pages — a big gap means a lot of visitors are blocking GA4."
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
        rowKey={(r, i) => `${r.page}-${i}`}
        pageSize={10}
      />
    </Stack>
  );
}
