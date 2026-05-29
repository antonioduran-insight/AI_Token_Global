import { Card, Stack, Text } from '@sanity/ui';
import styled from 'styled-components';
import type { QueryRow } from '../lib/types';
import { formatNumber } from '../lib/formatters';

// Horizontal-bar chart of the top N queries by clicks. Visually
// reinforces the table — useful for at-a-glance "who's pulling weight".

interface Props {
  rows: QueryRow[];
  topN?: number;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: baseline;
`;

const Label = styled.span`
  font-size: 0.825rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Count = styled.span`
  font-size: 0.825rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
`;

const BarTrack = styled.div`
  grid-column: 1 / -1;
  background: rgba(127, 127, 127, 0.1);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: -0.1rem;
`;

const BarFill = styled.div<{ $width: number; $color: string }>`
  width: ${(p) => p.$width}%;
  height: 100%;
  background: ${(p) => p.$color};
  border-radius: 4px;
  transition: width 0.4s ease;
`;

// Grade colors so the bars vary subtly down the list rather than being
// one flat slab — keeps the eye moving.
const LOCALE_COLOR: Record<string, string> = {
  en: '#6155F1',
  es: '#3E81E5',
  id: '#0ABFBC',
};

export function TopQueriesBar({ rows, topN = 10 }: Props) {
  const top = [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, topN);
  const max = top.length === 0 ? 1 : top[0].clicks;

  return (
    <Card padding={4} radius={3} shadow={1}>
      <Stack space={3}>
        <Text
          size={0}
          weight="semibold"
          muted
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          Top {topN} by clicks
        </Text>
        <Wrap>
          {top.map((row) => {
            const width = (row.clicks / max) * 100;
            const color = LOCALE_COLOR[row.locale] ?? '#6155F1';
            return (
              <div key={`${row.query}-${row.locale}`}>
                <Row>
                  <Label title={row.query}>{row.query}</Label>
                  <Count>{formatNumber(row.clicks)}</Count>
                </Row>
                <BarTrack>
                  <BarFill $width={width} $color={color} />
                </BarTrack>
              </div>
            );
          })}
        </Wrap>
      </Stack>
    </Card>
  );
}
