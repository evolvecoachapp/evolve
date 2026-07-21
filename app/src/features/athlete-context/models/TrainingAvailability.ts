/**
 * Weekly training availability constraints.
 *
 * Structured facts only — no scheduling UI logic.
 */
export interface TrainingAvailability {
  /** Planned training days per week in `[1, 7]`. */
  readonly daysPerWeek: number;
  /** Typical session length in minutes. */
  readonly sessionDurationMinutes: number;
  /**
   * Preferred calendar days (`0` = Sunday … `6` = Saturday).
   * Empty means no preference.
   */
  readonly preferredDays: readonly number[];
}
