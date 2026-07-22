/**
 * Priority score 1–100 (higher = more prominent in sorted collections).
 * Deterministic ranking only — not a coaching recommendation weight.
 */
export type InsightPriority = number;

export const INSIGHT_PRIORITY_MIN = 1;
export const INSIGHT_PRIORITY_MAX = 100;
export const INSIGHT_PRIORITY_DEFAULT = 50;

export function isValidInsightPriority(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= INSIGHT_PRIORITY_MIN &&
    value <= INSIGHT_PRIORITY_MAX
  );
}
