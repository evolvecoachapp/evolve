/**
 * Lifetime training statistics for the records overview.
 *
 * Volume and session totals come from the analytics domain.
 */
export interface RecordSummary {
  /** Sum of session volumes across all completed workouts (kg·reps). */
  readonly totalLifetimeVolumeKg: number;
  /** Count of completed workout sessions. */
  readonly totalLifetimeSessions: number;
  /** Distinct exercises with at least one completed set. */
  readonly exerciseCount: number;
  /** ISO-8601 timestamp of the most recent record activity. `null` when empty. */
  readonly lastRecordAt: string | null;
}
