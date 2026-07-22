import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutRuntime } from "../models/WorkoutRuntime";
import type { WorkoutRuntimeSummary } from "../models/WorkoutRuntimeSummary";
import { buildSummary } from "./buildSummary";

/**
 * Deep-freeze a runtime snapshot (structural freeze of top-level + nested arrays).
 */
export function freezeRuntime(runtime: WorkoutRuntime): WorkoutRuntime {
  return Object.freeze({
    ...runtime,
    exercises: Object.freeze(
      runtime.exercises.map((exercise) =>
        Object.freeze({
          ...exercise,
          sets: Object.freeze(
            exercise.sets.map((set) =>
              Object.freeze({
                ...set,
                notes: Object.freeze([...set.notes]),
              }),
            ),
          ),
        }),
      ),
    ),
    completedExerciseIds: Object.freeze([...runtime.completedExerciseIds]),
    skippedExerciseIds: Object.freeze([...runtime.skippedExerciseIds]),
    progress: Object.freeze({ ...runtime.progress }),
    metrics: Object.freeze({ ...runtime.metrics }),
    configuration: Object.freeze({ ...runtime.configuration }),
    events: Object.freeze(
      runtime.events.map((event) => Object.freeze({ ...event })),
    ),
    restRuntime: runtime.restRuntime,
  });
}

/**
 * Freeze a public summary.
 */
export function freezeSummary(
  summary: WorkoutRuntimeSummary,
): WorkoutRuntimeSummary {
  return Object.freeze({
    ...summary,
    progress: Object.freeze({ ...summary.progress }),
  });
}

/**
 * Build and freeze a terminal WorkoutResult from a runtime.
 */
export function freezeResult(
  runtime: WorkoutRuntime,
  frozenAt: string,
): WorkoutResult {
  if (runtime.state !== "Completed" && runtime.state !== "Cancelled") {
    throw new Error(`cannot_freeze_result_from:${runtime.state}`);
  }

  const summary = freezeSummary(buildSummary(runtime));

  return Object.freeze({
    runtimeId: runtime.id,
    sessionId: runtime.sessionId,
    finalState: runtime.state,
    summary,
    progress: Object.freeze({ ...runtime.progress }),
    metrics: Object.freeze({ ...runtime.metrics }),
    events: Object.freeze(
      runtime.events.map((event) => Object.freeze({ ...event })),
    ),
    completedExerciseIds: Object.freeze([...runtime.completedExerciseIds]),
    skippedExerciseIds: Object.freeze([...runtime.skippedExerciseIds]),
    startedAt: runtime.startedAt,
    completedAt: runtime.completedAt,
    cancelledAt: runtime.cancelledAt,
    frozenAt,
  });
}
