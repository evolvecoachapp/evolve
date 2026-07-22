export type AdaptationActionKind =
  | "reduce_volume"
  | "reduce_intensity"
  | "swap_exercise"
  | "insert_recovery_day"
  | "adjust_schedule"
  | "maintain";

export const ADAPTATION_ACTION_KINDS = Object.freeze([
  "reduce_volume",
  "reduce_intensity",
  "swap_exercise",
  "insert_recovery_day",
  "adjust_schedule",
  "maintain",
] as const satisfies readonly AdaptationActionKind[]);

/**
 * Recommended adaptation action.
 * Recommendations only — never mutates workouts or prescriptions.
 */
export interface AdaptationAction {
  readonly kind: AdaptationActionKind;
  readonly targetExerciseId?: string;
  readonly targetWeekNumber?: number;
  /** Deterministic scalar describing recommended adjustment strength. */
  readonly magnitude: number;
  /** Lower values sort earlier (higher urgency). */
  readonly priority: number;
}
