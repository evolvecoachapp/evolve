import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { HistoryContext } from "../models/HistoryContext";
import { HistoryEntryCategories } from "../models/HistoryEntryCategory";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import type { WorkoutHistoryEntry } from "../models/WorkoutHistoryEntry";
import { freezeWorkoutHistoryEntry } from "../utils/freezeHistory";

/**
 * Aggregate a WorkoutResult into an immutable WorkoutHistoryEntry.
 * One responsibility: workout → history entry.
 */
export class WorkoutAggregator {
  aggregate(
    workoutResult: WorkoutResult,
    context: HistoryContext,
    frozenAt: string,
  ): WorkoutHistoryEntry {
    const occurredAt =
      workoutResult.completedAt ??
      workoutResult.cancelledAt ??
      workoutResult.frozenAt;

    const finalState = workoutResult.finalState;
    const title =
      finalState === "Completed" ? "Workout completed" : "Workout cancelled";

    return freezeWorkoutHistoryEntry({
      id: `hist:workout:${workoutResult.runtimeId}`,
      type: HistoryEntryTypes.WORKOUT,
      category: HistoryEntryCategories.TRAINING,
      occurredAt,
      title,
      description: `Workout ${finalState.toLowerCase()} (session ${workoutResult.sessionId})`,
      references: Object.freeze([
        Object.freeze({
          kind: "workout_runtime",
          id: workoutResult.runtimeId,
          label: "WorkoutRuntime",
        }),
        Object.freeze({
          kind: "workout_session",
          id: workoutResult.sessionId,
          label: "WorkoutSession",
        }),
      ]),
      evidence: Object.freeze({
        sourceType: "WorkoutResult",
        sourceId: workoutResult.runtimeId,
        attributes: Object.freeze({
          finalState,
          completedExerciseCount: workoutResult.completedExerciseIds.length,
          skippedExerciseCount: workoutResult.skippedExerciseIds.length,
          eventCount: workoutResult.events.length,
        }),
      }),
      context,
      metadata: Object.freeze({
        tags: Object.freeze(["workout", finalState.toLowerCase()]),
        attributes: Object.freeze({
          runtimeId: workoutResult.runtimeId,
          sessionId: workoutResult.sessionId,
        }),
      }),
      frozenAt,
      runtimeId: workoutResult.runtimeId,
      sessionId: workoutResult.sessionId,
      finalState,
    });
  }
}

export function createWorkoutAggregator(): WorkoutAggregator {
  return new WorkoutAggregator();
}
