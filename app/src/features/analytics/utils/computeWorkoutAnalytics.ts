import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import type { WorkoutAnalytics } from "../models/WorkoutAnalytics";
import { roundToTwo } from "./round";

/**
 * Sum completed set reps from exercise snapshots.
 * Legacy sessions without exercises fall back to averageCompletedReps × completedSets.
 */
export function sumSessionReps(session: CompletedWorkout): number {
  if (session.exercises.length > 0) {
    let reps = 0;
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        reps += set.reps;
      }
    }
    return reps;
  }

  if (
    session.averageCompletedReps != null &&
    Number.isFinite(session.averageCompletedReps) &&
    session.completedSets > 0
  ) {
    return Math.round(session.averageCompletedReps * session.completedSets);
  }

  return 0;
}

/** Aggregate totals across completed sessions. */
export function computeWorkoutAnalytics(
  sessions: readonly CompletedWorkout[],
): WorkoutAnalytics {
  if (sessions.length === 0) {
    return Object.freeze({
      totalWorkouts: 0,
      totalVolumeKg: 0,
      totalSets: 0,
      totalReps: 0,
      averageDurationSeconds: null,
      averageVolumeKg: null,
    });
  }

  let totalVolumeKg = 0;
  let totalSets = 0;
  let totalReps = 0;
  let totalDurationSeconds = 0;

  for (const session of sessions) {
    totalVolumeKg += session.estimatedVolumeKg;
    totalSets += session.completedSets;
    totalReps += sumSessionReps(session);
    totalDurationSeconds += session.durationSeconds;
  }

  const count = sessions.length;

  return Object.freeze({
    totalWorkouts: count,
    totalVolumeKg: roundToTwo(totalVolumeKg),
    totalSets,
    totalReps,
    averageDurationSeconds: roundToTwo(totalDurationSeconds / count),
    averageVolumeKg: roundToTwo(totalVolumeKg / count),
  });
}
