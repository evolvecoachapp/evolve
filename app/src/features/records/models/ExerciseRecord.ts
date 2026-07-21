import type { EstimatedOneRM } from "./EstimatedOneRM";

/**
 * Per-exercise lifetime personal records.
 *
 * Derived from completed workout history via the records repository.
 */
export interface ExerciseRecord {
  readonly exerciseId: string;
  readonly exerciseName: string;
  /** Heaviest completed set load (kg). `null` when no sets recorded. */
  readonly bestWeightKg: number | null;
  /** Best Epley estimated 1RM for this exercise. */
  readonly bestEstimatedOneRM: EstimatedOneRM | null;
  /** Highest single-set volume (weight × reps). */
  readonly bestSingleSetVolumeKg: number | null;
  /** Highest reps completed in a single set. */
  readonly bestReps: number | null;
  /** ISO-8601 timestamp of the most recent session that updated a record. */
  readonly lastRecordAt: string | null;
}
