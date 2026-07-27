/**
 * Deterministic adaptive workout modification kinds (Sprint 24.3 product).
 * Applied surgically to an existing WorkoutPlan — not full regeneration.
 */
export const WorkoutModificationKinds = {
  REPLACE_EXERCISE: "replace_exercise",
  REMOVE_EXERCISE: "remove_exercise",
  ADD_EXERCISE: "add_exercise",
  REDUCE_DURATION: "reduce_duration",
  INCREASE_DURATION: "increase_duration",
  REDUCE_INTENSITY: "reduce_intensity",
  INCREASE_INTENSITY: "increase_intensity",
  MODIFY_VOLUME: "modify_volume",
  EQUIPMENT_UNAVAILABLE: "equipment_unavailable",
  INJURY_LIMITATION: "injury_limitation",
  FATIGUE_ADJUSTMENT: "fatigue_adjustment",
  RECOVERY_ADJUSTMENT: "recovery_adjustment",
  FOCUS_MUSCLE_GROUP: "focus_muscle_group",
  UNKNOWN: "unknown",
} as const;

export type WorkoutModificationKind =
  (typeof WorkoutModificationKinds)[keyof typeof WorkoutModificationKinds];

export const ALL_WORKOUT_MODIFICATION_KINDS: readonly WorkoutModificationKind[] =
  Object.freeze(Object.values(WorkoutModificationKinds));
