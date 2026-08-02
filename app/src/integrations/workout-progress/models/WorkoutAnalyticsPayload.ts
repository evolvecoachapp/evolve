import type { WorkoutMetric } from "./WorkoutMetric";

/** Immutable analytics payload projected from workout domain state. */
export interface WorkoutAnalyticsPayload {
  readonly sessionId: string;
  readonly workoutId: string | null;
  readonly workoutTitle: string | null;
  readonly exerciseId: string | null;
  readonly exerciseName: string | null;
  readonly setId: string | null;
  readonly setNumber: number | null;
  readonly weightKg: number | null;
  readonly reps: number | null;
  readonly volumeKg: number | null;
  readonly durationMinutes: number | null;
  readonly exerciseCount: number | null;
  readonly rpeAverage: number | null;
  readonly personalRecordId: string | null;
  readonly estimatedOneRepMaxKg: number | null;
  readonly completedAt: string | null;
  readonly metrics: readonly WorkoutMetric[];
}

export function createWorkoutAnalyticsPayload(
  input: WorkoutAnalyticsPayload,
): WorkoutAnalyticsPayload {
  return Object.freeze({
    ...input,
    metrics: Object.freeze([...input.metrics]),
  });
}

export function createEmptyWorkoutAnalyticsPayload(
  sessionId: string,
): WorkoutAnalyticsPayload {
  return createWorkoutAnalyticsPayload({
    sessionId,
    workoutId: null,
    workoutTitle: null,
    exerciseId: null,
    exerciseName: null,
    setId: null,
    setNumber: null,
    weightKg: null,
    reps: null,
    volumeKg: null,
    durationMinutes: null,
    exerciseCount: null,
    rpeAverage: null,
    personalRecordId: null,
    estimatedOneRepMaxKg: null,
    completedAt: null,
    metrics: [],
  });
}
