import { Card, Stack, Text, Flex } from '@sanity/ui';
import styled from 'styled-components';
import type { QueryRow } from '../lib/types';
import { formatNumber } from '../lib/formatters';

// Histogram of queries grouped by SERP position bucket. Answers
// "how many of our queries are on page 1 vs page 2 vs deeper?" — a
// strategic view editors rarely get from raw tables.

interface Props {
  rows: QueryRow[];
}

interface Bucket {
  label: string;
  help: string;
  min: number;
  max: number;
  color: string;
}

const BUCKETS: Bucket[] = [
  { label: 'Top 3', help: 'Pos 1–3', min: 1, max: 3.99, color: '#22c55e' },
  { label: 'Rest of page 1', help: 'Pos 4–10', min: 4, max: 10.99, color: '#84cc16' },
  { label: 'Page 2', help: 'Pos 11–20', min: 11, max: 20.99, color: '#f59e0b' },
  { label: 'Page 3+', help: 'Pos 21+', min: 21, max: Infinity, color: '#ef4444' },
];

const COLUMN_HEIGHT = 140;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
`;

const ColumnWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
`;

const ColumnTrack = styled.div`
  height: ${COLUMN_HEIGHT}px;
  background: rgba(127, 127, 127, 0.06);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
`;

const ColumnFill = styled.div<{ $heightPct: number; $color: string }>`
  width: 100%;
  height: ${(p) => p.$heightPct}%;
  background: ${(p) => p.$color};
  border-radius: 6px 6px 0 0;
  transition: height 0.4s ease;
`;

const ColumnCount = styled.div`
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
`;

const ColumnPercent = styled.div`
  text-align: center;
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
`;

const ColumnLabel = styled.div`
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const ColumnHelp = styled.div`
  text-align: center;
  font-size: 0.7rem;
  opacity: 0.55;
`;

export function PositionDistribution({ rows }: Props) {
  const total = rows.length;
  const counts = BUCKETS.map((b) =>
    rows.filter((r) => r.position >= b.min && r.position <= b.max).length,
  );
  const maxCount = Math.max(...counts, 1);

  return (
    <Card padding={4} radius={3} shadow={1}>
      <Stack space={4}>
        <Flex align="baseline" justify="space-between" gap={3} wrap="wrap">
          <Text
            size={0}
            weight="semibold"
            muted
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Position distribution
          </Text>
          <Text size={1} muted>
            {formatNumber(total)} queries · lower position = better ranking
          </Text>
        </Flex>
        <ChartGrid>
          {BUCKETS.map((bucket, i) => {
            const count = counts[i];
            const pct = total === 0 ? 0 : (count / total) * 100;
            const heightPct = (count / maxCount) * 100;
            return (
              <ColumnWrap key={bucket.label}>
                <ColumnCount>{formatNumber(count)}</ColumnCount>
                <ColumnPercent>{pct.toFixed(1)}%</ColumnPercent>
                <ColumnTrack>
                  <ColumnFill $heightPct={heightPct} $color={bucket.color} />
                </ColumnTrack>
                <ColumnLabel>{bucket.label}</ColumnLabel>
                <ColumnHelp>{bucket.help}</ColumnHelp>
              </ColumnWrap>
            );
          })}
        </ChartGrid>
      </Stack>
    </Card>
  );
}
