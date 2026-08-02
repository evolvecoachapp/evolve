import type { PersonalRecord } from "../../../features/workout/models/PersonalRecord";
import type { WorkoutSession } from "../../../features/workout/models/WorkoutSession";
import type { WorkoutSessionSummary } from "../../../features/workout/types/workoutSessionSummary";
import {
  createEmptyWorkoutAnalyticsPayload,
  createWorkoutAnalyticsPayload,
  type WorkoutAnalyticsPayload,
} from "../models";

export function mapWorkoutSessionToStartedPayload(
  session: WorkoutSession,
): WorkoutAnalyticsPayload {
  return createWorkoutAnalyticsPayload({
    ...createEmptyWorkoutAnalyticsPayload(session.id),
    workoutId: session.workoutId,
    workoutTitle: session.title,
    exerciseCount: session.exercises.length,
    completedAt: session.startedAt,
  });
}

export function mapWorkoutSessionSummaryToCompletionPayload(
  summary: WorkoutSessionSummary,
): WorkoutAnalyticsPayload {
  return createWorkoutAnalyticsPayload({
    sessionId: summary.sessionId,
    workoutId: null,
    workoutTitle: summary.title,
    exerciseId: null,
    exerciseName: null,
    setId: null,
    setNumber: null,
    weightKg: null,
    reps: null,
    volumeKg: summary.estimatedVolumeKg,
    durationMinutes: Math.round(summary.durationSeconds / 60),
    exerciseCount: summary.completedExercises,
    rpeAverage: null,
    personalRecordId: null,
    estimatedOneRepMaxKg: null,
    completedAt: summary.completedAt,
    metrics: [],
  });
}

export function mapWorkoutSessionToCancellationPayload(
  session: WorkoutSession,
  cancelledAt: string,
): WorkoutAnalyticsPayload {
  return createWorkoutAnalyticsPayload({
    ...createEmptyWorkoutAnalyticsPayload(session.id),
    workoutId: session.workoutId,
    workoutTitle: session.title,
    exerciseCount: session.exercises.length,
    completedAt: cancelledAt,
  });
}

export function mapWorkoutSessionToSkippedPayload(
  session: WorkoutSession,
  skippedAt: string,
): WorkoutAnalyticsPayload {
  return createWorkoutAnalyticsPayload({
    ...createEmptyWorkoutAnalyticsPayload(session.id),
    workoutId: session.workoutId,
    workoutTitle: session.title,
    exerciseCount: session.exercises.length,
    completedAt: skippedAt,
  });
}

export function mapWorkoutPersonalRecordToPayload(
  record: PersonalRecord,
): WorkoutAnalyticsPayload {
  return createWorkoutAnalyticsPayload({
    sessionId: record.sessionId,
    workoutId: null,
    workoutTitle: null,
    exerciseId: record.exerciseId,
    exerciseName: record.exerciseName,
    setId: null,
    setNumber: null,
    weightKg: record.weight,
    reps: record.reps,
    volumeKg: null,
    durationMinutes: null,
    exerciseCount: null,
    rpeAverage: null,
    personalRecordId: record.id,
    estimatedOneRepMaxKg: null,
    completedAt: record.achievedAt,
    metrics: [],
  });
}
