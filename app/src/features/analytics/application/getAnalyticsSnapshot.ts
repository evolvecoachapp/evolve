import type { ExerciseAnalytics } from "../models/ExerciseAnalytics";
import type { WeeklyAnalytics } from "../models/WeeklyAnalytics";
import type { WorkoutAnalytics } from "../models/WorkoutAnalytics";
import type { WorkoutTrend } from "../models/WorkoutTrend";
import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";

/** Bundled analytics snapshot for the presentation hook. */
export interface AnalyticsSnapshot {
  readonly workout: WorkoutAnalytics;
  readonly exercises: readonly ExerciseAnalytics[];
  readonly weekly: WeeklyAnalytics;
  readonly volumeTrend: WorkoutTrend;
  readonly workoutFrequency: WorkoutTrend;
}

export interface GetAnalyticsSnapshotOptions {
  readonly weeks?: number;
  readonly referenceDate?: Date;
  readonly repository?: WorkoutAnalyticsRepository;
}

/**
 * Loads overview analytics in parallel for the `useWorkoutAnalytics` hook.
 * Exercise-frequency trends remain on-demand via `getExerciseFrequency`.
 */
export async function getAnalyticsSnapshot({
  weeks = 8,
  referenceDate,
  repository = workoutAnalyticsRepository,
}: GetAnalyticsSnapshotOptions = {}): Promise<AnalyticsSnapshot> {
  const [workout, exercises, weekly, volumeTrend, workoutFrequency] =
    await Promise.all([
      repository.getWorkoutAnalytics(),
      repository.getExerciseAnalytics(),
      repository.getWeeklyAnalytics(referenceDate),
      repository.getVolumeTrend(weeks, referenceDate),
      repository.getWorkoutFrequency(weeks, referenceDate),
    ]);

  return Object.freeze({
    workout,
    exercises,
    weekly,
    volumeTrend,
    workoutFrequency,
  });
}
