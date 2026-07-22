import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type {
  CompletedSetSample,
  ExerciseLifecycleSample,
} from "../calculators/VolumeCalculator";

/**
 * Extract completed-set samples from an EventStream.
 */
export function extractCompletedSets(
  stream: EventStream,
): readonly CompletedSetSample[] {
  const samples: CompletedSetSample[] = [];

  for (const event of stream.events) {
    if (event.type !== "set_completed") {
      continue;
    }

    const { payload } = event;
    samples.push(
      Object.freeze({
        setRuntimeId: payload.setRuntimeId,
        exerciseRuntimeId: payload.exerciseRuntimeId,
        setIndex: payload.setIndex,
        weight: payload.weight ?? null,
        repetitions: payload.repetitions ?? null,
        rpe: payload.rpe ?? null,
        rir: payload.rir ?? null,
      }),
    );
  }

  return Object.freeze(samples);
}

/**
 * Extract exercise lifecycle samples from an EventStream.
 */
export function extractExerciseLifecycle(
  stream: EventStream,
): readonly ExerciseLifecycleSample[] {
  const byId = new Map<string, ExerciseLifecycleSample>();

  for (const event of stream.events) {
    if (
      event.type !== "exercise_started" &&
      event.type !== "exercise_completed" &&
      event.type !== "exercise_skipped"
    ) {
      continue;
    }

    const { payload } = event;
    const existing = byId.get(payload.exerciseRuntimeId);
    const skipped = event.type === "exercise_skipped";
    const completed = event.type === "exercise_completed";

    byId.set(
      payload.exerciseRuntimeId,
      Object.freeze({
        exerciseRuntimeId: payload.exerciseRuntimeId,
        exerciseId: payload.exerciseId,
        exerciseName: payload.exerciseName,
        order: payload.order,
        skipped: existing?.skipped === true || skipped,
        completed: existing?.completed === true || completed,
      }),
    );
  }

  return Object.freeze([...byId.values()]);
}

/**
 * Resolve analysis end timestamp from a WorkoutResult.
 */
export function resolveEndedAt(result: WorkoutResult): string | null {
  if (result.finalState === "Completed") {
    return result.completedAt;
  }
  return result.cancelledAt;
}
