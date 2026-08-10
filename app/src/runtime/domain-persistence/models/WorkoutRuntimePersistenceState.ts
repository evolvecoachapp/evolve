import type { WorkoutRuntime } from "../../../features/workout-runtime/models/experience/WorkoutRuntime";

/**
 * Persisted in-session workout runtime state (Sprint 35.4).
 * Wraps the Sprint 31.2 experience read model.
 */
export interface WorkoutRuntimePersistenceState {
  readonly athleteId: string;
  readonly runtime: WorkoutRuntime | null;
}

export function createWorkoutRuntimePersistenceState(
  input: WorkoutRuntimePersistenceState,
): WorkoutRuntimePersistenceState {
  return Object.freeze({ ...input });
}
