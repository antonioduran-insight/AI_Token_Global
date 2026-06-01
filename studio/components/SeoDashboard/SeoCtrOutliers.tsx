import { useState, useMemo } from 'react';
import { Stack, Flex, Badge } from '@sanity/ui';
import styled from 'styled-components';
import type { CtrOutlierRow, CtrOutliersSnapshot } from './lib/types';
import { loadCtrOutliers } from './lib/loadSnapshot';
import { formatNumber, formatPercent, formatPosition } from './lib/formatters';
import { expectedCtrForPosition } from './lib/ctrCurve';
import {
  LocaleFilter,
  type LocaleFilterValue,
  filterByLocale,
  countByLocale,
} from './LocaleFilter';
import { SortableTable, type ColumnDef } from './SortableTable';
import { useSortableData } from './lib/useSortableData';
import { SectionHeader } from './SectionHeader';
import { CtrVsPositionScatter } from './charts/CtrVsPositionScatter';
import { GLOSSARY } from './lib/glossary';

const data: CtrOutliersSnapshot = loadCtrOutliers();
const LOCALE_COUNTS = countByLocale(data.rows);

interface AugmentedRow extends CtrOutlierRow {
  /** Industry-typical CTR for this row's average position. */
  expectedCtr: number;
  /** How far below expected, as a percent of expected (e.g. 0.62 = 62% below). */
  shortfall: number;
  /** Estimated additional clicks if CTR matched the expected curve. */
  potentialGain: number;
}

function augment(row: CtrOutlierRow): AugmentedRow {
  const expectedCtr = expectedCtrForPosition(row.position);
  const ctrGap = Math.max(0, expectedCtr - row.ctr);
  const shortfall = expectedCtr === 0 ? 0 : ctrGap / expectedCtr;
  const potentialGain = Math.round(ctrGap * row.impressions);
  return { ...row, expectedCtr, shortfall, potentialGain };
}

const PathText = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.825rem;
  font-weight: 500;
  word-break: break-word;
`;

const ShortfallText = styled.span<{ $severity: 'high' | 'mid' | 'low' }>`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: ${(p) =>
    p.$severity === 'high' ? '#ef4444' : p.$severity === 'mid' ? '#f59e0b' : 'inherit'};
`;

const GainText = styled.span<{ $magnitude: 'high' | 'mid' | 'low' }>`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: ${(p) =>
    p.$magnitude === 'high' ? '#22c55e' : p.$magnitude === 'mid' ? '#84cc16' : 'inherit'};
`;

function severityFor(shortfall: number): 'high' | 'mid' | 'low' {
  if (shortfall >= 0.6) return 'high';
  if (shortfall >= 0.4) return 'mid';
  return 'low';
}

function magnitudeFor(gain: number): 'high' | 'mid' | 'low' {
  if (gain >= 300) return 'high';
  if (gain >= 100) return 'mid';
  return 'low';
}

const COLUMNS: ColumnDef<AugmentedRow>[] = [
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
    key: 'position',
    label: 'Position',
    align: 'right',
    numeric: true,
    defaultSort: 'asc',
    render: (row) => formatPosition(row.position),
    tooltip: GLOSSARY.position,
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
    defaultSort: 'asc',
    render: (row) => formatPercent(row.ctr, 2),
    tooltip: GLOSSARY.ctr,
  },
  {
    key: 'expectedCtr',
    label: 'Expected CTR',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatPercent(row.expectedCtr, 2),
    tooltip: GLOSSARY.expectedCtr,
  },
  {
    key: 'shortfall',
    label: 'Shortfall',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => (
      <ShortfallText $severity={severityFor(row.shortfall)}>
        −{(row.shortfall * 100).toFixed(0)}%
      </ShortfallText>
    ),
    tooltip: GLOSSARY.shortfall,
  },
  {
    key: 'potentialGain',
    label: 'Gain at typical CTR',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => (
      <GainText $magnitude={magnitudeFor(row.potentialGain)}>
        +{formatNumber(row.potentialGain)}
      </GainText>
    ),
    tooltip: GLOSSARY.ctrGainAtTypical,
  },
];

export function SeoCtrOutliers() {
  const [locale, setLocale] = useState<LocaleFilterValue>('all');

  const filteredAndAugmented = useMemo(() => {
    const filtered = filterByLocale(data.rows, locale);
    return filtered.map(augment);
  }, [locale]);

  const { sortKey, sortDir, sortedRows, toggleSort } = useSortableData(
    filteredAndAugmented,
    'potentialGain',
    COLUMNS,
  );

  return (
    <Stack space={4}>
      <SectionHeader
        title="CTR Outliers"
        subtitle="Pages with strong rankings but unusually low click-through rates. The page itself is ranking fine — the search-result snippet (the page title and meta description that Google displays) is what's not compelling enough. Action here is to rewrite the title and meta description, not the page content."
        rangeDays={data.meta.rangeDays}
        visibleCount={sortedRows.length}
        totalCount={data.rows.length}
        countNoun="pages"
      />

      <CtrVsPositionScatter rows={data.rows} />

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
