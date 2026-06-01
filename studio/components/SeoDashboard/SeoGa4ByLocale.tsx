import { Fragment } from 'react';
import { Card, Stack, Text, Box, Flex } from '@sanity/ui';
import styled from 'styled-components';
import type {
  Ga4LocaleAggregate,
  Ga4LocaleSnapshot,
  Ga4OverviewBucket,
} from './lib/types';
import { loadGa4Locale } from './lib/loadSnapshot';
import {
  formatCompact,
  formatPercent,
  formatDuration,
  computeDelta,
  type DeltaSummary,
  type DesirableDirection,
} from './lib/formatters';
import { SectionHeader } from './SectionHeader';
import { InfoTooltip } from './InfoTooltip';

const data: Ga4LocaleSnapshot = loadGa4Locale();

// Totals across locales, for the "share of total" shown on Users / Engaged sessions.
const TOTALS = data.locales.reduce(
  (acc, l) => ({
    users: acc.users + l.current.users,
    engagedSessions: acc.engagedSessions + l.current.engagedSessions,
  }),
  { users: 0, engagedSessions: 0 },
);

const GOOD = '#22c55e';
const BAD = '#ef4444';
const FLAT = '#9ca3af';
const HAIRLINE = 'rgba(127, 127, 127, 0.18)';

const Grid = styled.div<{ $localeCount: number }>`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) repeat(${(p) => p.$localeCount}, minmax(160px, 1.4fr));
  border: 1px solid ${HAIRLINE};
  border-radius: 12px;
  overflow: hidden;

  /* Drop the bottom border on the last row (metric label + one cell per locale)
     so it doesn't double up with the grid's own border. Locale-count-aware: the
     last row is the final (localeCount + 1) cells, whatever the locale count. */
  > *:nth-last-child(-n + ${(p) => p.$localeCount + 1}) {
    border-bottom: 0;
  }
`;

const Cell = styled.div<{ $align?: 'left' | 'right' }>`
  padding: 1rem 1.125rem;
  border-bottom: 1px solid ${HAIRLINE};
  text-align: ${(p) => p.$align ?? 'left'};
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

type ShareKey = 'users' | 'engagedSessions';

interface MetricRowSpec {
  key: string;
  label: string;
  help: string;
  tooltip: string;
  pick: (b: Ga4OverviewBucket) => number;
  format: (value: number) => string;
  desirable: DesirableDirection;
  /** If set, also show share-of-total next to the value. */
  showShare?: ShareKey;
}

const ROWS: MetricRowSpec[] = [
  {
    key: 'users',
    label: 'Users',
    help: `Last ${data.meta.rangeDays} days`,
    tooltip: 'Distinct visitors to this locale in the period.',
    pick: (b) => b.users,
    format: formatCompact,
    desirable: 'up',
    showShare: 'users',
  },
  {
    key: 'engagedSessions',
    label: 'Engaged sessions',
    help: `Last ${data.meta.rangeDays} days`,
    tooltip:
      'Sessions that lasted >10s, fired a key event, or had 2+ pageviews.',
    pick: (b) => b.engagedSessions,
    format: formatCompact,
    desirable: 'up',
    showShare: 'engagedSessions',
  },
  {
    key: 'engagementRate',
    label: 'Engagement rate',
    help: 'Engaged ÷ total sessions',
    tooltip: 'Share of sessions that were engaged. Replaces bounce rate.',
    pick: (b) => b.engagementRate,
    format: (v) => formatPercent(v, 1),
    desirable: 'up',
  },
  {
    key: 'avgEngagementSeconds',
    label: 'Avg. engagement time',
    help: 'Per active user',
    tooltip: 'Average time visitors were actively engaged, per user.',
    pick: (b) => b.avgEngagementSeconds,
    format: formatDuration,
    desirable: 'up',
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
  locale: Ga4LocaleAggregate;
}) {
  const currentValue = row.pick(locale.current);
  const previousValue = row.pick(locale.previous);
  const delta = computeDelta(currentValue, previousValue, row.desirable);

  const share = row.showShare
    ? shareOfTotal(currentValue, TOTALS[row.showShare])
    : null;

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

export function SeoGa4ByLocale() {
  return (
    <Stack space={4}>
      <SectionHeader
        title="By Locale"
        rangeDays={data.meta.rangeDays}
        subtitle="The same behaviour metrics from Behavior Overview, broken out per language version of the site (EN · ES · ID). Use it to see where engaged traffic is concentrated and whether a locale is pulling its weight."
      />

      <Grid $localeCount={data.locales.length}>
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
              <MetricLabel>
                {row.label}
                <InfoTooltip
                  description={row.tooltip}
                  ariaLabel={`Definition of ${row.label}`}
                />
              </MetricLabel>
              <MetricLabelHelp>{row.help}</MetricLabelHelp>
            </Cell>
            {data.locales.map((l) => (
              <MetricCell key={`${row.key}-${l.locale}`} row={row} locale={l} />
            ))}
          </Fragment>
        ))}
      </Grid>

      <ContextStrip padding={4} radius={2} shadow={1}>
        <Stack space={4}>
          {data.locales.map((l) => (
            <Flex key={`ctx-${l.locale}`} gap={4} wrap="wrap" align="flex-start">
              <Box style={{ minWidth: 96, paddingTop: 2 }}>
                <Text size={1} weight="semibold">
                  {l.label}
                </Text>
              </Box>
              <Stack space={3} flex={1}>
                <Stack space={2}>
                  <Text size={1} muted>
                    Top page:
                  </Text>
                  <Box>
                    <PathTag>{l.topPage}</PathTag>
                  </Box>
                </Stack>
                <Stack space={2}>
                  <Text size={1} muted>
                    Top channel:
                  </Text>
                  <Text size={1} weight="semibold">
                    {l.topChannel}
                  </Text>
                </Stack>
              </Stack>
            </Flex>
          ))}
        </Stack>
      </ContextStrip>
    </Stack>
  );
}
