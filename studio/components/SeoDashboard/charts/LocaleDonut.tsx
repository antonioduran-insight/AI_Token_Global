import { Card } from '@sanity/ui';
import styled from 'styled-components';
import type { LocaleAggregate } from '../lib/types';
import { formatNumber } from '../lib/formatters';

// Donut chart of click-share per locale. Reads directly from the
// existing By Locale snapshot, no new data fetching.

interface Props {
  locales: LocaleAggregate[];
}

// Same brand-aligned palette used by the rest of the dashboard.
const COLOR_BY_LOCALE: Record<string, string> = {
  en: '#6155F1',
  es: '#3E81E5',
  id: '#0ABFBC',
};

const FALLBACK_COLORS = ['#F59E0B', '#84CC16', '#EC4899', '#06B6D4'];

function colorFor(locale: string, index: number): string {
  return COLOR_BY_LOCALE[locale] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1.5rem;
  align-items: center;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;

const Legend = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const LegendRow = styled.li`
  display: grid;
  grid-template-columns: 12px 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
`;

const Swatch = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${(p) => p.$color};
`;

const LegendLabel = styled.span`
  font-weight: 500;
`;

const LegendValue = styled.span`
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
`;

const LegendPercent = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

const CenterText = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.55;
`;

const CenterValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  margin-top: 0.15rem;
`;

const RADIUS = 70;
const STROKE_WIDTH = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function LocaleDonut({ locales }: Props) {
  const total = locales.reduce((sum, l) => sum + l.current.clicks, 0);
  let cumulative = 0;
  const segments = locales.map((l, i) => {
    const fraction = total === 0 ? 0 : l.current.clicks / total;
    const start = cumulative;
    cumulative += fraction;
    return {
      label: l.label,
      locale: l.locale,
      clicks: l.current.clicks,
      fraction,
      start,
      color: colorFor(l.locale, i),
    };
  });

  return (
    <Card padding={4} radius={3} shadow={1}>
      <Wrap>
        <svg
          viewBox="0 0 200 200"
          width="180"
          height="180"
          role="img"
          aria-label="Click share by locale"
        >
          {/* track */}
          <circle
            cx={100}
            cy={100}
            r={RADIUS}
            fill="none"
            stroke="rgba(127,127,127,0.12)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* segments */}
          {segments.map((seg) => {
            if (seg.fraction === 0) return null;
            return (
              <circle
                key={seg.locale}
                cx={100}
                cy={100}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${seg.fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={-seg.start * CIRCUMFERENCE}
                transform="rotate(-90 100 100)"
                strokeLinecap="butt"
              />
            );
          })}
          {/* center text */}
          <foreignObject x="50" y="74" width="100" height="52">
            <div style={{ textAlign: 'center' }}>
              <CenterText>Total</CenterText>
              <CenterValue>{formatNumber(total)}</CenterValue>
            </div>
          </foreignObject>
        </svg>

        <Legend>
          {segments.map((seg) => (
            <LegendRow key={seg.locale}>
              <Swatch $color={seg.color} />
              <LegendLabel>
                {seg.label} <span style={{ opacity: 0.55 }}>/{seg.locale}</span>
              </LegendLabel>
              <LegendValue>{formatNumber(seg.clicks)}</LegendValue>
              <LegendPercent>{(seg.fraction * 100).toFixed(1)}%</LegendPercent>
            </LegendRow>
          ))}
        </Legend>
      </Wrap>
    </Card>
  );
}
