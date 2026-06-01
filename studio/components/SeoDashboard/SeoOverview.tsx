import { Card, Stack, Heading, Text, Box, Flex } from '@sanity/ui';
import type { OverviewSnapshot } from './lib/types';
import { loadOverview, loadQueries } from './lib/loadSnapshot';
import {
  formatNumber,
  formatCompact,
  formatPercent,
  formatPosition,
  computeDelta,
  type DeltaSummary,
} from './lib/formatters';
import { PositionDistribution } from './charts/PositionDistribution';
import { InfoTooltip } from './InfoTooltip';
import { GLOSSARY } from './lib/glossary';
import { SectionHeader } from './SectionHeader';

const data: OverviewSnapshot = loadOverview();
const queriesData = loadQueries();

interface ScorecardSpec {
  label: string;
  value: string;
  delta: DeltaSummary;
  helpText: string;
  tooltip: string;
}

function buildScorecards(d: OverviewSnapshot): ScorecardSpec[] {
  const { current, previous, meta } = d;
  return [
    {
      label: 'Clicks',
      value: formatNumber(current.clicks),
      delta: computeDelta(current.clicks, previous.clicks, 'up'),
      helpText: `vs prior ${meta.rangeDays} days`,
      tooltip: GLOSSARY.clicks,
    },
    {
      label: 'Impressions',
      value: formatCompact(current.impressions),
      delta: computeDelta(current.impressions, previous.impressions, 'up'),
      helpText: `vs prior ${meta.rangeDays} days`,
      tooltip: GLOSSARY.impressions,
    },
    {
      label: 'CTR',
      value: formatPercent(current.ctr),
      delta: computeDelta(current.ctr, previous.ctr, 'up'),
      helpText: 'clicks ÷ impressions',
      tooltip: GLOSSARY.ctr,
    },
    {
      label: 'Avg. position',
      value: formatPosition(current.avgPosition),
      delta: computeDelta(current.avgPosition, previous.avgPosition, 'down'),
      helpText: 'lower is better',
      tooltip: GLOSSARY.avgPosition,
    },
  ];
}

// Color tokens. Picked to read clearly in both light and dark Studio themes.
const GOOD = '#22c55e';
const BAD = '#ef4444';
const FLAT = '#9ca3af';

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

export function SeoOverview() {
  const scorecards = buildScorecards(data);

  return (
    <Stack space={4}>
      <SectionHeader
        title="Overview"
        rangeDays={data.meta.rangeDays}
        subtitle="Site-wide totals for the last 30 days, with the change vs. the prior 30 days. Use this as a 5-second status check on whether the site is growing. The histogram below shows where your search rankings sit — page 1, page 2, or deeper."
      />

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {scorecards.map((s) => (
          <Card key={s.label} padding={4} radius={3} shadow={1} tone="default">
            <Stack space={3}>
              <Flex align="center">
                <Text
                  size={0}
                  weight="semibold"
                  muted
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  {s.label}
                </Text>
                <InfoTooltip description={s.tooltip} ariaLabel={`Definition of ${s.label}`} />
              </Flex>
              <Heading
                as="div"
                size={5}
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.value}
              </Heading>
              <Flex align="center" gap={2} wrap="wrap">
                <Text
                  size={1}
                  weight="semibold"
                  style={{
                    color: deltaColor(s.delta),
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {deltaArrow(s.delta)} {deltaMagnitude(s.delta)}
                </Text>
                <Text size={1} muted>
                  {s.helpText}
                </Text>
              </Flex>
            </Stack>
          </Card>
        ))}
      </Box>

      <PositionDistribution rows={queriesData.rows} />
    </Stack>
  );
}
