/**
 * Week-over-week volume comparison and session rate.
 *
 * Weeks are Monday–Sunday in UTC, keyed by the ISO date of the Monday.
 */
export interface WeeklyAnalytics {
  /** Volume (kg·reps) in the week containing the reference date. */
  readonly currentWeekVolumeKg: number;
  /** Volume (kg·reps) in the immediately preceding UTC week. */
  readonly previousWeekVolumeKg: number;
  /**
   * Average sessions per UTC week from the earliest workout through the
   * current week (inclusive). `0` when there is no history.
   */
  readonly sessionsPerWeek: number;
}
