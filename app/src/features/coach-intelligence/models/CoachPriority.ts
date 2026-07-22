/**
 * Coaching priority score (1–100). Higher = more prominent.
 * Ranking metadata only — not a recommendation or prompt.
 */
export type CoachPriority = number;

export const COACH_PRIORITY_MIN = 1;
export const COACH_PRIORITY_MAX = 100;
export const COACH_PRIORITY_DEFAULT = 50;

export function isValidCoachPriority(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= COACH_PRIORITY_MIN &&
    value <= COACH_PRIORITY_MAX
  );
}
