import { Card, Stack, Heading, Text, Box, Flex } from '@sanity/ui';
import type { CloudflareOverviewSnapshot } from './lib/types';
import { loadCloudflareOverview } from './lib/loadSnapshot';
import {
  formatCompact,
  formatLoadMs,
  computeDelta,
  type DeltaSummary,
} from './lib/formatters';
import { SectionHeader } from './SectionHeader';

const data: CloudflareOverviewSnapshot = loadCloudflareOverview();

interface ScorecardSpec {
  label: string;
  value: string;
  delta: DeltaSummary;
  helpText: string;
}

function buildScorecards(d: CloudflareOverviewSnapshot): ScorecardSpec[] {
  const { current, previous, meta } = d;
  return [
    {
      label: 'Visits',
      value: formatCompact(current.visits),
      delta: computeDelta(current.visits, previous.visits, 'up'),
      helpText: `vs prior ${meta.rangeDays} days`,
    },
    {
      label: 'Page views',
      value: formatCompact(current.pageViews),
      delta: computeDelta(current.pageViews, previous.pageViews, 'up'),
      helpText: `vs prior ${meta.rangeDays} days`,
    },
    {
      label: 'Median load time',
      value: formatLoadMs(current.medianLoadMs),
      delta: computeDelta(current.medianLoadMs, previous.medianLoadMs, 'down'),
      helpText: 'lower is better',
    },
  ];
}

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

export function SeoCfOverview() {
  const scorecards = buildScorecards(data);

  return (
    <Stack space={4}>
      <SectionHeader
        title="Overview"
        rangeDays={data.meta.rangeDays}
        subtitle="Cloudflare Web Analytics for the last 30 days. It's cookieless and not blocked by ad-blockers, so it counts visitors GA4 misses — treat it as an honest headcount. It also measures real page-load speed, which the other sources don't."
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
                style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
              >
                {s.value}
              </Heading>
              <Flex align="center" gap={2} wrap="wrap">
                <Text
                  size={1}
                  weight="semibold"
                  style={{ color: deltaColor(s.delta), fontVariantNumeric: 'tabular-nums' }}
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
