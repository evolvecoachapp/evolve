import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { WorkoutRuntime } from "../../../features/workout-runtime/models/experience/WorkoutRuntime";

export interface PersistWorkoutRuntimeMutationInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly runtime: WorkoutRuntime | null;
}

/**
 * Persists in-session workout runtime state through WorkoutRuntimePersistenceService.build().
 * Successful builds are observed by Runtime Observer for write-through persistence.
 */
export function persistWorkoutRuntimeMutation(
  input: PersistWorkoutRuntimeMutationInput,
): void {
  getCompositionRoot()
    .resolve("WorkoutRuntimePersistenceService")
    .build({
      athleteId: input.athleteId,
      requestId: input.requestId,
      runtime: input.runtime,
    });
}

export function readPersistedWorkoutRuntime(
  athleteId: string,
): WorkoutRuntime | null {
  return (
    getCompositionRoot()
      .resolve("WorkoutRuntimePersistenceService")
      .getState(athleteId)?.runtime ?? null
  );
}
