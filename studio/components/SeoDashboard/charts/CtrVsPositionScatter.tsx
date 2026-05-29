import { Card, Stack, Text, Flex } from '@sanity/ui';
import styled from 'styled-components';
import type { PageRow } from '../lib/types';
import { expectedCtrForPosition } from '../lib/ctrCurve';

// Scatter plot of CTR vs avg. position for each row, with the
// industry-standard expected-CTR curve overlaid. Points well below
// the curve are CTR outliers — visually unmistakable.

interface Props {
  rows: PageRow[];
}

const VIEW_W = 560;
const VIEW_H = 280;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

const X_MAX = 25;
const Y_MAX = 0.20;

const Wrap = styled.div`
  width: 100%;
  position: relative;
`;

const SvgWrap = styled.div`
  width: 100%;
  svg { width: 100%; height: auto; display: block; }
`;

const LegendStrip = styled(Flex)`
  font-size: 0.75rem;
  opacity: 0.85;
`;

const LegendSwatch = styled.span<{ $color: string; $isLine?: boolean }>`
  display: inline-block;
  width: 14px;
  height: ${(p) => (p.$isLine ? '2px' : '10px')};
  background: ${(p) => p.$color};
  border-radius: ${(p) => (p.$isLine ? '0' : '50%')};
  margin-right: 0.4rem;
  vertical-align: middle;
`;

function xPos(position: number): number {
  const clamped = Math.min(Math.max(position, 1), X_MAX);
  return PAD_LEFT + ((clamped - 1) / (X_MAX - 1)) * PLOT_W;
}

function yPos(ctr: number): number {
  const clamped = Math.min(Math.max(ctr, 0), Y_MAX);
  return PAD_TOP + PLOT_H - (clamped / Y_MAX) * PLOT_H;
}

function buildCurvePath(): string {
  const points: string[] = [];
  for (let p = 1; p <= X_MAX; p += 0.5) {
    points.push(`${xPos(p)},${yPos(Math.min(expectedCtrForPosition(p), Y_MAX))}`);
  }
  return `M ${points.join(' L ')}`;
}

const X_TICKS = [1, 5, 10, 15, 20, 25];
const Y_TICKS = [0, 0.05, 0.1, 0.15, 0.2];

const GOOD = '#22c55e';
const BAD = '#ef4444';
const CURVE = 'rgba(127, 127, 127, 0.55)';
const GRID = 'rgba(127, 127, 127, 0.15)';
const AXIS = 'rgba(127, 127, 127, 0.5)';

export function CtrVsPositionScatter({ rows }: Props) {
  const curvePath = buildCurvePath();
  const points = rows.map((row) => {
    const expected = expectedCtrForPosition(row.position);
    const isBelow = row.ctr < expected * 0.7; // > 30% below curve = clear outlier
    return {
      key: `${row.page}`,
      x: xPos(row.position),
      y: yPos(row.ctr),
      color: isBelow ? BAD : GOOD,
      label: row.page,
    };
  });

  return (
    <Card padding={4} radius={3} shadow={1}>
      <Stack space={3}>
        <Flex align="baseline" justify="space-between" gap={3} wrap="wrap">
          <Text
            size={0}
            weight="semibold"
            muted
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            CTR vs. position
          </Text>
          <LegendStrip align="center" gap={3} wrap="wrap">
            <span>
              <LegendSwatch $color={CURVE} $isLine /> Expected curve
            </span>
            <span>
              <LegendSwatch $color={GOOD} /> At or above
            </span>
            <span>
              <LegendSwatch $color={BAD} /> Below expected
            </span>
          </LegendStrip>
        </Flex>
        <Wrap>
          <SvgWrap>
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label="CTR vs position scatter">
              {/* horizontal gridlines */}
              {Y_TICKS.map((t) => (
                <line
                  key={`gy-${t}`}
                  x1={PAD_LEFT}
                  x2={PAD_LEFT + PLOT_W}
                  y1={yPos(t)}
                  y2={yPos(t)}
                  stroke={GRID}
                  strokeWidth={1}
                />
              ))}
              {/* axes */}
              <line x1={PAD_LEFT} x2={PAD_LEFT} y1={PAD_TOP} y2={PAD_TOP + PLOT_H} stroke={AXIS} />
              <line
                x1={PAD_LEFT}
                x2={PAD_LEFT + PLOT_W}
                y1={PAD_TOP + PLOT_H}
                y2={PAD_TOP + PLOT_H}
                stroke={AXIS}
              />
              {/* expected-CTR curve */}
              <path
                d={curvePath}
                fill="none"
                stroke={CURVE}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              {/* data points */}
              {points.map((pt) => (
                <circle
                  key={pt.key}
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill={pt.color}
                  opacity={0.78}
                >
                  <title>{`${pt.label}`}</title>
                </circle>
              ))}
              {/* x-axis tick labels */}
              {X_TICKS.map((t) => (
                <text
                  key={`xt-${t}`}
                  x={xPos(t)}
                  y={PAD_TOP + PLOT_H + 18}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.6}
                >
                  {t}
                </text>
              ))}
              {/* y-axis tick labels */}
              {Y_TICKS.map((t) => (
                <text
                  key={`yt-${t}`}
                  x={PAD_LEFT - 8}
                  y={yPos(t) + 3}
                  textAnchor="end"
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.6}
                >
                  {(t * 100).toFixed(0)}%
                </text>
              ))}
              {/* axis titles */}
              <text
                x={PAD_LEFT + PLOT_W / 2}
                y={VIEW_H - 4}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                opacity={0.65}
                fontWeight={600}
              >
                AVG. POSITION
              </text>
              <text
                x={12}
                y={PAD_TOP + PLOT_H / 2}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                opacity={0.65}
                fontWeight={600}
                transform={`rotate(-90 12 ${PAD_TOP + PLOT_H / 2})`}
              >
                CTR
              </text>
            </svg>
          </SvgWrap>
        </Wrap>
      </Stack>
    </Card>
  );
}
