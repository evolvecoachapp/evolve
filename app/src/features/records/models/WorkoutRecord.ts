/**
 * Cross-exercise lifetime personal record highlights.
 *
 * Aggregated from all completed sessions — not persisted separately.
 */
export interface WorkoutRecord {
  /** Heaviest load lifted across all exercises (kg). */
  readonly bestWeightKg: number | null;
  /** Highest Epley estimated 1RM across all exercises (kg). */
  readonly bestEstimatedOneRMKg: number | null;
  /** Highest single-session volume (kg·reps). */
  readonly bestSessionVolumeKg: number | null;
  /** Highest single-set volume (weight × reps). */
  readonly bestSingleSetVolumeKg: number | null;
  /** Highest reps completed in any single set. */
  readonly bestReps: number | null;
  /** ISO-8601 timestamp of the most recent record-setting session. */
  readonly lastRecordAt: string | null;
}
