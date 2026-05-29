import { useState, useMemo } from 'react';
import { Stack, Flex, Badge, Card, Text } from '@sanity/ui';
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
    key: 'position',
    label: 'Position',
    align: 'right',
    numeric: true,
    defaultSort: 'asc',
    render: (row) => formatPosition(row.position),
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
    defaultSort: 'asc',
    render: (row) => formatPercent(row.ctr, 2),
  },
  {
    key: 'expectedCtr',
    label: 'Expected CTR',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatPercent(row.expectedCtr, 2),
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
        rangeDays={data.meta.rangeDays}
        visibleCount={sortedRows.length}
        totalCount={data.rows.length}
        countNoun="pages"
      />

      <Card padding={3} radius={2} tone="caution">
        <Text size={1}>
          Pages where actual CTR is meaningfully below the typical CTR for the position
          they rank at. The ranking is fine — the snippet (title tag + meta description)
          isn't compelling enough. <strong>Editorial action:</strong> rewrite the page's
          title and meta description. <strong>Gain</strong> estimates additional clicks
          per {data.meta.rangeDays}-day window if CTR matches the curve.
        </Text>
      </Card>

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
      />
    </Stack>
  );
}
