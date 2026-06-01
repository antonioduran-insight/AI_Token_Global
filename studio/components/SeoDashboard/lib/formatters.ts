// Pure formatting helpers for SEO dashboard numbers.
// No React, no Sanity dependencies — easy to unit test if we ever want to.

/** "8,432" — integers with thousands separators. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

/** "287.7K" / "1.2M" — compact form for large counts. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** "2.93%" — for CTR. Input is a fraction in [0, 1]. */
export function formatPercent(fraction: number, digits = 2): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** "18.4" — average position, one decimal place. */
export function formatPosition(value: number): string {
  return value.toFixed(1);
}

/** "1m 14s" / "52s" / "2m" — a duration given in seconds. */
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const minutes = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${minutes}m` : `${minutes}m ${rem}s`;
}

/** "850 ms" / "1.18 s" — a load time given in milliseconds. Lower is better. */
export function formatLoadMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/** Direction the metric should move for the result to be "good." */
export type DesirableDirection = 'up' | 'down';

export interface DeltaSummary {
  /** Relative change as a fraction (e.g. 0.069 for +6.9%). */
  relative: number;
  /** Absolute change in source units (current - previous). */
  absolute: number;
  /** Whether the delta moved in the desirable direction. */
  isGood: boolean;
  /** 1 / -1 / 0 — sign of the absolute change. */
  sign: 1 | -1 | 0;
}

/** Compute a delta + whether it's a good or bad outcome. */
export function computeDelta(
  current: number,
  previous: number,
  desirable: DesirableDirection,
): DeltaSummary {
  const absolute = current - previous;
  const relative = previous === 0 ? 0 : absolute / previous;
  const sign: 1 | -1 | 0 = absolute > 0 ? 1 : absolute < 0 ? -1 : 0;
  const isGood = sign === 0 ? true : desirable === 'up' ? sign === 1 : sign === -1;
  return { relative, absolute, isGood, sign };
}

/** "+6.9%" / "−3.2%" / "—" with the unicode minus and em-dash. */
export function formatRelativeDelta(relative: number, digits = 1): string {
  if (relative === 0) return '—';
  const pct = (relative * 100).toFixed(digits);
  return relative > 0 ? `+${pct}%` : `−${pct.replace('-', '')}%`;
}

/** "↑ 541" / "↓ 0.7" / "—". For absolute change. */
export function formatAbsoluteDelta(
  absolute: number,
  format: (n: number) => string = (n) => formatNumber(Math.abs(n)),
): string {
  if (absolute === 0) return '—';
  const arrow = absolute > 0 ? '↑' : '↓';
  return `${arrow} ${format(absolute)}`;
}
