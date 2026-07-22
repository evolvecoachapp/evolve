/**
 * Multi-week window over which prescriptions evolve.
 * Week numbers are 1-based and contiguous.
 */
export interface ProgressionWindow {
  readonly startWeek: number;
  readonly weekCount: number;
}

export const DEFAULT_PROGRESSION_WEEK_COUNT = 4;

export function createDefaultProgressionWindow(
  weekCount: number = DEFAULT_PROGRESSION_WEEK_COUNT,
): ProgressionWindow {
  return Object.freeze({
    startWeek: 1,
    weekCount: Math.max(1, weekCount),
  });
}
