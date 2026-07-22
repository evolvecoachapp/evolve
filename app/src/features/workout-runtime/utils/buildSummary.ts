import type { WorkoutRuntime } from "../models/WorkoutRuntime";
import type { WorkoutRuntimeSummary } from "../models/WorkoutRuntimeSummary";
import { getCurrentExercise, getCurrentSet } from "../validators";

export { buildMetrics } from "./calculateProgress";

/**
 * Generate a public runtime summary snapshot.
 */
export function buildSummary(runtime: WorkoutRuntime): WorkoutRuntimeSummary {
  const exercise = getCurrentExercise(runtime);
  const currentSet = exercise ? getCurrentSet(exercise) : null;

  return Object.freeze({
    runtimeId: runtime.id,
    sessionId: runtime.sessionId,
    sessionName: runtime.session.name,
    state: runtime.state,
    currentExerciseId: exercise?.id ?? null,
    currentExerciseName: exercise?.name ?? null,
    currentSetIndex: currentSet?.setIndex ?? null,
    progress: runtime.progress,
    completedExerciseCount: runtime.completedExerciseIds.length,
    skippedExerciseCount: runtime.skippedExerciseIds.length,
    eventCount: runtime.events.length,
    startedAt: runtime.startedAt,
    pausedAt: runtime.pausedAt,
  });
}
