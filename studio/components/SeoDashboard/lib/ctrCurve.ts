// Industry-standard position → organic CTR curve.
//
// Values are the commonly cited Advanced Web Ranking / sistrix median
// figures from 2024-2025 SERP studies. They're approximations — actual
// CTR varies by SERP feature presence (snippets, ads, etc.) — but they
// are a useful baseline for "is this page underperforming its rank?"
//
// Used by the CTR Outliers section to compute "expected vs actual" gaps.

const CTR_BY_POSITION: Record<number, number> = {
  1: 0.28,
  2: 0.15,
  3: 0.11,
  4: 0.08,
  5: 0.07,
  6: 0.05,
  7: 0.04,
  8: 0.035,
  9: 0.03,
  10: 0.025,
};

/** Linear-interpolating lookup. Extends as a slow taper past position 10. */
export function expectedCtrForPosition(position: number): number {
  if (position <= 1) return CTR_BY_POSITION[1];
  const floor = Math.floor(position);
  const ceil = Math.ceil(position);
  const valueAt = (idx: number): number =>
    CTR_BY_POSITION[idx] ?? Math.max(0.005, 0.025 - (idx - 10) * 0.0015);
  if (floor === ceil) return valueAt(floor);
  return valueAt(floor) + (valueAt(ceil) - valueAt(floor)) * (position - floor);
}
