import { useState, useMemo } from 'react';
import { Stack, Flex, Badge } from '@sanity/ui';
import styled from 'styled-components';
import type { StrikingRow, StrikingSnapshot } from './lib/types';
import { loadStriking } from './lib/loadSnapshot';
import { formatNumber, formatPercent, formatPosition } from './lib/formatters';
import {
  LocaleFilter,
  type LocaleFilterValue,
  filterByLocale,
  countByLocale,
} from './LocaleFilter';
import { SortableTable, type ColumnDef } from './SortableTable';
import { useSortableData } from './lib/useSortableData';
import { SectionHeader } from './SectionHeader';
import { GLOSSARY } from './lib/glossary';

// Industry-standard CTR at the top of page 1. Used to estimate what each
// striking-distance query *could* be doing for us if it ranked higher.
// 0.28 is the commonly cited Advanced Web Ranking figure for the median
// position-1 organic CTR across 2024-2025 SERP studies.
const TARGET_CTR_AT_POSITION_1 = 0.28;

const data: StrikingSnapshot = loadStriking();
const LOCALE_COUNTS = countByLocale(data.rows);

interface AugmentedRow extends StrikingRow {
  potentialClicks: number;
  potentialGain: number;
}

function augment(row: StrikingRow): AugmentedRow {
  const potentialClicks = Math.round(row.impressions * TARGET_CTR_AT_POSITION_1);
  return {
    ...row,
    potentialClicks,
    potentialGain: potentialClicks - row.clicks,
  };
}

const QueryText = styled.span`
  font-weight: 500;
`;

const GainText = styled.span<{ $magnitude: 'high' | 'mid' | 'low' }>`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: ${(p) => (p.$magnitude === 'high' ? '#22c55e' : p.$magnitude === 'mid' ? '#84cc16' : 'inherit')};
`;

function magnitudeFor(gain: number): 'high' | 'mid' | 'low' {
  if (gain >= 2000) return 'high';
  if (gain >= 800) return 'mid';
  return 'low';
}

const COLUMNS: ColumnDef<AugmentedRow>[] = [
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
    key: 'clicks',
    label: 'Current clicks',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatNumber(row.clicks),
    tooltip: GLOSSARY.clicks,
  },
  {
    key: 'potentialClicks',
    label: 'Potential at pos. 1',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => formatNumber(row.potentialClicks),
    tooltip: GLOSSARY.potentialAtPosition1,
  },
  {
    key: 'potentialGain',
    label: 'Gain',
    align: 'right',
    numeric: true,
    defaultSort: 'desc',
    render: (row) => (
      <GainText $magnitude={magnitudeFor(row.potentialGain)}>
        +{formatNumber(row.potentialGain)}
      </GainText>
    ),
    tooltip: GLOSSARY.potentialGain,
  },
];

export function SeoStrikingDistance() {
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
        title="Striking Distance"
        subtitle="Queries you're almost winning at — ranking page 2 of Google (positions ~11–20). A content refresh can push them onto page 1, where click-through rates are 3–5× higher. This is the highest-leverage editorial work on a content site. The Gain column estimates extra clicks if each query reached position 1."
        rangeDays={data.meta.rangeDays}
        visibleCount={sortedRows.length}
        totalCount={data.rows.length}
        countNoun="queries"
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
        rowKey={(row, i) => `${row.query}-${row.locale}-${i}`}
        pageSize={10}
      />
    </Stack>
  );
}
