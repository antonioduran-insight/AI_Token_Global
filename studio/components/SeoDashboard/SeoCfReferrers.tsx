import { Stack } from '@sanity/ui';
import type { CloudflareReferrerRow, CloudflareReferrersSnapshot } from './lib/types';
import { loadCloudflareReferrers } from './lib/loadSnapshot';
import { formatNumber } from './lib/formatters';
import { SortableTable, type ColumnDef } from './SortableTable';
import { useSortableData } from './lib/useSortableData';
import { SectionHeader } from './SectionHeader';

const data: CloudflareReferrersSnapshot = loadCloudflareReferrers();

const COLUMNS: ColumnDef<CloudflareReferrerRow>[] = [
  {
    key: 'referrer',
    label: 'Referrer',
    align: 'left',
    numeric: false,
    defaultSort: 'asc',
    tooltip: 'The site that sent the visitor. "Direct / none" = typed the URL, a bookmark, or an app with no referrer.',
  },
  {
    key: 'visits',
    label: 'Visits',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (r) => formatNumber(r.visits),
    tooltip: 'Cloudflare visits originating from this referrer.',
  },
];

export function SeoCfReferrers() {
  const { sortKey, sortDir, sortedRows, toggleSort } = useSortableData(
    data.rows,
    'visits',
    COLUMNS,
  );

  return (
    <Stack space={4}>
      <SectionHeader
        title="Top Referrers"
        subtitle="Which sites send you traffic. Useful for spotting where you're being shared or cited — and which external pages are worth nurturing."
        rangeDays={data.meta.rangeDays}
        visibleCount={sortedRows.length}
        totalCount={data.rows.length}
        countNoun="referrers"
      />
      <SortableTable
        rows={sortedRows}
        columns={COLUMNS}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        rowKey={(r, i) => `${r.referrer}-${i}`}
        pageSize={10}
      />
    </Stack>
  );
}
