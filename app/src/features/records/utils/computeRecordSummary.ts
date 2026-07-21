import type { WorkoutAnalytics } from "../../analytics/models/WorkoutAnalytics";
import type { ExerciseRecord } from "../models/ExerciseRecord";
import type { RecordSummary } from "../models/RecordSummary";
import { roundToTwo } from "./round";

/**
 * Lifetime statistics summary.
 * Volume and session counts come from analytics — not recomputed here.
 */
export function computeRecordSummary(
  workout: WorkoutAnalytics,
  exercises: readonly ExerciseRecord[],
): RecordSummary {
  let lastRecordAt: string | null = null;

  for (const exercise of exercises) {
    if (exercise.lastRecordAt == null) {
      continue;
    }
    if (lastRecordAt == null || exercise.lastRecordAt > lastRecordAt) {
      lastRecordAt = exercise.lastRecordAt;
    }
  }

  return Object.freeze({
    totalLifetimeVolumeKg: roundToTwo(workout.totalVolumeKg),
    totalLifetimeSessions: workout.totalWorkouts,
    exerciseCount: exercises.length,
    lastRecordAt,
  });
}
