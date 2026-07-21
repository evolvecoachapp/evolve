/**
 * Estimated one-rep max derived with the Epley formula.
 *
 * Computed in the records domain — never calculated in UI.
 */
export interface EstimatedOneRM {
  readonly exerciseId: string;
  readonly exerciseName: string;
  /** Load (kg) used for the estimate. */
  readonly weightKg: number;
  /** Reps completed at `weightKg`. */
  readonly reps: number;
  /** Epley estimated 1RM in kilograms. */
  readonly estimatedKg: number;
  /** ISO-8601 timestamp of the session that produced this estimate. */
  readonly achievedAt: string;
}
