/**
 * Immutable athlete / session constraints applied during generation.
 */
export interface WorkoutConstraints {
  readonly athleteConstraints: readonly string[];
  readonly availability: readonly string[];
  readonly recoveryConstraints: readonly string[];
  readonly equipment: readonly string[];
  readonly excludedExerciseIds: readonly string[];
}
