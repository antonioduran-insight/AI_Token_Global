import { Fragment } from 'react';
import { Card, Stack, Text, Box, Flex } from '@sanity/ui';
import styled from 'styled-components';
import type { LocaleAggregate, LocaleSnapshot, OverviewBucket } from './lib/types';
import { loadLocaleAggregate } from './lib/loadSnapshot';
import {
  formatNumber,
  formatCompact,
  formatPercent,
  formatPosition,
  computeDelta,
  type DeltaSummary,
  type DesirableDirection,
} from './lib/formatters';
import { SectionHeader } from './SectionHeader';
import { LocaleDonut } from './charts/LocaleDonut';

const data: LocaleSnapshot = loadLocaleAggregate();

// Sum each metric across all locales so we can show "share of total"
// inside the Clicks / Impressions rows.
const TOTALS = data.locales.reduce(
  (acc, l) => ({
    clicks: acc.clicks + l.current.clicks,
    impressions: acc.impressions + l.current.impressions,
  }),
  { clicks: 0, impressions: 0 },
);

const GOOD = '#22c55e';
const BAD = '#ef4444';
const FLAT = '#9ca3af';
const HAIRLINE = 'rgba(127, 127, 127, 0.18)';

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) repeat(3, minmax(160px, 1.4fr));
  border: 1px solid ${HAIRLINE};
  border-radius: 12px;
  overflow: hidden;
`;

const Cell = styled.div<{ $align?: 'left' | 'right' }>`
  padding: 1rem 1.125rem;
  border-bottom: 1px solid ${HAIRLINE};
  text-align: ${(p) => p.$align ?? 'left'};
  &:nth-last-child(-n + 4) { border-bottom: 0; }
`;

const HeaderCell = styled(Cell)`
  background: rgba(127, 127, 127, 0.05);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
`;

const MetricLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.65;
`;

const MetricLabelHelp = styled.div`
  font-size: 0.7rem;
  margin-top: 0.2rem;
  opacity: 0.5;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
`;

const ValueText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  line-height: 1.1;
`;

const ShareText = styled.span`
  font-size: 0.78rem;
  font-weight: 500;
  margin-left: 0.4rem;
  opacity: 0.55;
  font-variant-numeric: tabular-nums;
`;

const DeltaText = styled.div<{ $color: string }>`
  margin-top: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${(p) => p.$color};
`;

const ContextStrip = styled(Card)`
  margin-top: 1rem;
`;

const PathTag = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 500;
`;

const LocaleCode = styled.span`
  opacity: 0.6;
  font-weight: 500;
`;

function deltaColor(d: DeltaSummary): string {
  if (d.sign === 0) return FLAT;
  return d.isGood ? GOOD : BAD;
}

function deltaArrow(d: DeltaSummary): string {
  if (d.sign === 0) return '·';
  return d.sign === 1 ? '↑' : '↓';
}

function deltaMagnitude(d: DeltaSummary): string {
  if (d.sign === 0) return '—';
  return `${(Math.abs(d.relative) * 100).toFixed(1)}%`;
}

interface MetricRowSpec {
  key: string;
  label: string;
  help: string;
  pick: (b: OverviewBucket) => number;
  format: (value: number) => string;
  desirable: DesirableDirection;
  /** If true, also show share-of-total in parens next to the value. */
  showShare?: 'clicks' | 'impressions';
}

const ROWS: MetricRowSpec[] = [
  {
    key: 'clicks',
    label: 'Clicks',
    help: `Last ${data.meta.rangeDays} days`,
    pick: (b) => b.clicks,
    format: formatNumber,
    desirable: 'up',
    showShare: 'clicks',
  },
  {
    key: 'impressions',
    label: 'Impressions',
    help: `Last ${data.meta.rangeDays} days`,
    pick: (b) => b.impressions,
    format: formatCompact,
    desirable: 'up',
    showShare: 'impressions',
  },
  {
    key: 'ctr',
    label: 'CTR',
    help: 'Clicks ÷ impressions',
    pick: (b) => b.ctr,
    format: (v) => formatPercent(v, 2),
    desirable: 'up',
  },
  {
    key: 'position',
    label: 'Avg. position',
    help: 'Lower is better',
    pick: (b) => b.avgPosition,
    format: formatPosition,
    desirable: 'down',
  },
];

function shareOfTotal(value: number, total: number): string {
  if (total === 0) return '—';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function MetricCell({
  row,
  locale,
}: {
  row: MetricRowSpec;
  locale: LocaleAggregate;
}) {
  const currentValue = row.pick(locale.current);
  const previousValue = row.pick(locale.previous);
  const delta = computeDelta(currentValue, previousValue, row.desirable);

  const totalForShare = row.showShare ? TOTALS[row.showShare] : 0;
  const share = row.showShare ? shareOfTotal(currentValue, totalForShare) : null;

  return (
    <Cell $align="right">
      <ValueText>
        {row.format(currentValue)}
        {share ? <ShareText>{share}</ShareText> : null}
      </ValueText>
      <DeltaText $color={deltaColor(delta)}>
        {deltaArrow(delta)} {deltaMagnitude(delta)}
      </DeltaText>
    </Cell>
  );
}

export function SeoByLocale() {
  return (
    <Stack space={4}>
      <SectionHeader title="By Locale" rangeDays={data.meta.rangeDays} />

      <LocaleDonut locales={data.locales} />

      <Grid>
        {/* Header row */}
        <HeaderCell>Metric</HeaderCell>
        {data.locales.map((l) => (
          <HeaderCell key={`h-${l.locale}`} $align="right">
            {l.label} <LocaleCode>/{l.locale}</LocaleCode>
          </HeaderCell>
        ))}

        {/* Data rows */}
        {ROWS.map((row) => (
          <Fragment key={row.key}>
            <Cell>
              <MetricLabel>{row.label}</MetricLabel>
              <MetricLabelHelp>{row.help}</MetricLabelHelp>
            </Cell>
            {data.locales.map((l) => (
              <MetricCell key={`${row.key}-${l.locale}`} row={row} locale={l} />
            ))}
          </Fragment>
        ))}
      </Grid>

      <ContextStrip padding={3} radius={2} shadow={1}>
        <Stack space={3}>
          {data.locales.map((l) => (
            <Flex key={`ctx-${l.locale}`} align="baseline" gap={3} wrap="wrap">
              <Box style={{ minWidth: 64 }}>
                <Text size={1} weight="semibold">
                  {l.label}
                </Text>
              </Box>
              <Text size={1} muted>
                Top query:{' '}
                <Text as="span" size={1} weight="semibold">
                  {l.topQuery}
                </Text>
                {'  ·  '}
                Top page: <PathTag>{l.topPage}</PathTag>
              </Text>
            </Flex>
          ))}
        </Stack>
      </ContextStrip>
    </Stack>
  );
}
