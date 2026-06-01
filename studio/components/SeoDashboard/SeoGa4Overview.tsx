import { Card, Stack, Heading, Text, Box, Flex } from '@sanity/ui';
import type { Ga4OverviewSnapshot } from './lib/types';
import { loadGa4Overview } from './lib/loadSnapshot';
import {
  formatCompact,
  formatPercent,
  formatDuration,
  computeDelta,
  type DeltaSummary,
} from './lib/formatters';
import { SectionHeader } from './SectionHeader';

const data: Ga4OverviewSnapshot = loadGa4Overview();

interface ScorecardSpec {
  label: string;
  value: string;
  delta: DeltaSummary;
  helpText: string;
}

function buildScorecards(d: Ga4OverviewSnapshot): ScorecardSpec[] {
  const { current, previous, meta } = d;
  return [
    {
      label: 'Users',
      value: formatCompact(current.users),
      delta: computeDelta(current.users, previous.users, 'up'),
      helpText: `vs prior ${meta.rangeDays} days`,
    },
    {
      label: 'Engaged sessions',
      value: formatCompact(current.engagedSessions),
      delta: computeDelta(current.engagedSessions, previous.engagedSessions, 'up'),
      helpText: `vs prior ${meta.rangeDays} days`,
    },
    {
      label: 'Engagement rate',
      value: formatPercent(current.engagementRate, 1),
      delta: computeDelta(current.engagementRate, previous.engagementRate, 'up'),
      helpText: 'engaged ÷ total sessions',
    },
    {
      label: 'Avg. engagement time',
      value: formatDuration(current.avgEngagementSeconds),
      delta: computeDelta(
        current.avgEngagementSeconds,
        previous.avgEngagementSeconds,
        'up',
      ),
      helpText: 'per active user',
    },
  ];
}

// Same delta color tokens as the GSC Overview, for a consistent read.
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

export function SeoGa4Overview() {
  const scorecards = buildScorecards(data);

  return (
    <Stack space={4}>
      <SectionHeader
        title="Behavior Overview"
        rangeDays={data.meta.rangeDays}
        subtitle="On-site behaviour from Google Analytics 4 for the last 30 days, with the change vs. the prior 30 days. Where the Search sections show how people find the site, this shows what they do once they arrive — engagement rate replaces the old bounce rate."
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
              <Text
                size={0}
                weight="semibold"
                muted
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                {s.label}
              </Text>
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
    </Stack>
  );
}
