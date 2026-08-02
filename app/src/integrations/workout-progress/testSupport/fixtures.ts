import type { WorkoutSession } from "../../../features/workout/models/WorkoutSession";
import type { PersonalRecord } from "../../../features/workout/models/PersonalRecord";
import type { WorkoutSessionSummary } from "../../../features/workout/types/workoutSessionSummary";
import {
  createWorkoutProgressEvent,
  createWorkoutProgressMetadata,
} from "../models";

const FIXED_PUBLISHED_AT = "2026-08-02T20:00:00.000Z";

export function createTestWorkoutSession(
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession {
  return {
    id: "session-001",
    workoutId: "workout-001",
    title: "Upper Strength",
    subtitle: "Week 1 Day 1",
    status: "in_progress",
    startedAt: "2026-08-02T18:00:00.000Z",
    completedAt: null,
    exercises: [],
    ...overrides,
  };
}

export function createTestWorkoutSessionSummary(
  overrides: Partial<WorkoutSessionSummary> = {},
): WorkoutSessionSummary {
  return Object.freeze({
    sessionId: "session-001",
    title: "Upper Strength",
    programName: "Powerbuilding",
    durationSeconds: 3720,
    completedExercises: 6,
    totalExercises: 7,
    completedSets: 18,
    skippedSets: 1,
    totalSets: 20,
    completionPercent: 95,
    estimatedVolumeKg: 8450,
    averageCompletedReps: 8,
    completedAt: "2026-08-02T19:02:00.000Z",
    exercises: Object.freeze([]),
    ...overrides,
  });
}

export function createTestPersonalRecord(
  overrides: Partial<PersonalRecord> = {},
): PersonalRecord {
  return Object.freeze({
    id: "pr-001",
    exerciseId: "ex-bench",
    exerciseName: "Barbell Bench Press",
    muscleGroup: "chest",
    weight: 100,
    reps: 5,
    achievedAt: "2026-08-02T19:00:00.000Z",
    sessionId: "session-001",
    ...overrides,
  });
}

export function createTestWorkoutProgressEvent(
  overrides: Partial<ReturnType<typeof createWorkoutProgressEvent>> = {},
) {
  return createWorkoutProgressEvent({
    id: "evt-001",
    type: "WorkoutStarted",
    occurredAt: FIXED_PUBLISHED_AT,
    metadata: createWorkoutProgressMetadata({
      source: "workout",
      correlationId: "corr-001",
      sessionId: "session-001",
      workoutId: "workout-001",
      athleteId: null,
      publishedAt: FIXED_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      sessionId: "session-001",
      workoutId: "workout-001",
      workoutTitle: "Upper Strength",
      exerciseId: null,
      exerciseName: null,
      setId: null,
      setNumber: null,
      weightKg: null,
      reps: null,
      volumeKg: null,
      durationMinutes: null,
      exerciseCount: 7,
      rpeAverage: null,
      personalRecordId: null,
      estimatedOneRepMaxKg: null,
      completedAt: null,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export { FIXED_PUBLISHED_AT };
