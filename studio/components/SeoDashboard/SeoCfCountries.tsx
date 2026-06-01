import { Stack } from '@sanity/ui';
import type { CloudflareCountryRow, CloudflareCountriesSnapshot } from './lib/types';
import { loadCloudflareCountries } from './lib/loadSnapshot';
import { formatNumber } from './lib/formatters';
import { SortableTable, type ColumnDef } from './SortableTable';
import { useSortableData } from './lib/useSortableData';
import { SectionHeader } from './SectionHeader';

const data: CloudflareCountriesSnapshot = loadCloudflareCountries();

const COLUMNS: ColumnDef<CloudflareCountryRow>[] = [
  {
    key: 'country',
    label: 'Country',
    align: 'left',
    numeric: false,
    defaultSort: 'asc',
    tooltip: 'Visitor country, as resolved by Cloudflare.',
  },
  {
    key: 'visits',
    label: 'Visits',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (r) => formatNumber(r.visits),
    tooltip: 'Cloudflare visits from this country.',
  },
];

export function SeoCfCountries() {
  const { sortKey, sortDir, sortedRows, toggleSort } = useSortableData(
    data.rows,
    'visits',
    COLUMNS,
  );

  return (
    <Stack space={4}>
      <SectionHeader
        title="Countries"
        subtitle="Where visitors are, by country. Sanity-check that your locale traffic lines up with geography — e.g. that the Spanish pages are reaching Spanish-speaking countries."
        rangeDays={data.meta.rangeDays}
        visibleCount={sortedRows.length}
        totalCount={data.rows.length}
        countNoun="countries"
      />
      <SortableTable
        rows={sortedRows}
        columns={COLUMNS}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        rowKey={(r, i) => `${r.country}-${i}`}
        pageSize={10}
      />
    </Stack>
  );
}
