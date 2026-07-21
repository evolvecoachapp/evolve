import type { WorkoutSessionSummary } from "../types/workoutSessionSummary";
import type { CompletedWorkout } from "../models/CompletedWorkout";

/**
 * Maps a presentation `WorkoutSessionSummary` to the persisted domain model.
 * Pure — no I/O.
 */
export function toCompletedWorkout(
  summary: WorkoutSessionSummary,
): CompletedWorkout {
  return Object.freeze({
    id: summary.sessionId,
    sessionId: summary.sessionId,
    title: summary.title,
    programName: summary.programName,
    durationSeconds: summary.durationSeconds,
    completedExercises: summary.completedExercises,
    totalExercises: summary.totalExercises,
    completedSets: summary.completedSets,
    skippedSets: summary.skippedSets,
    totalSets: summary.totalSets,
    completionPercent: summary.completionPercent,
    estimatedVolumeKg: summary.estimatedVolumeKg,
    averageCompletedReps: summary.averageCompletedReps,
    completedAt: summary.completedAt,
  });
}
