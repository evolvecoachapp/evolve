import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { WorkoutProgress } from "../../workout-runtime/models/WorkoutProgress";
import type { WorkoutRuntimeMetrics } from "../../workout-runtime/models/WorkoutRuntimeMetrics";
import type { WorkoutRuntimeSummary } from "../../workout-runtime/models/WorkoutRuntimeSummary";

export const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";
export const STARTED_AT = "2026-07-22T10:00:00.000Z";
export const COMPLETED_AT = "2026-07-22T10:45:00.000Z";

function createProgress(
  overrides: Partial<WorkoutProgress> = {},
): WorkoutProgress {
  return Object.freeze({
    totalExercises: overrides.totalExercises ?? 2,
    completedExercises: overrides.completedExercises ?? 2,
    skippedExercises: overrides.skippedExercises ?? 0,
    remainingExercises: overrides.remainingExercises ?? 0,
    totalSets: overrides.totalSets ?? 4,
    completedSets: overrides.completedSets ?? 4,
    skippedSets: overrides.skippedSets ?? 0,
    remainingSets: overrides.remainingSets ?? 0,
    completionPercent: overrides.completionPercent ?? 100,
  });
}

function createMetrics(
  overrides: Partial<WorkoutRuntimeMetrics> = {},
): WorkoutRuntimeMetrics {
  return Object.freeze({
    totalExercises: overrides.totalExercises ?? 2,
    totalSets: overrides.totalSets ?? 4,
    completedSets: overrides.completedSets ?? 4,
    skippedSets: overrides.skippedSets ?? 0,
    completedExercises: overrides.completedExercises ?? 2,
    skippedExercises: overrides.skippedExercises ?? 0,
    eventCount: overrides.eventCount ?? 10,
    pauseCount: overrides.pauseCount ?? 0,
  });
}

function createSummary(
  progress: WorkoutProgress,
  overrides: Partial<WorkoutRuntimeSummary> = {},
): WorkoutRuntimeSummary {
  return Object.freeze({
    runtimeId: overrides.runtimeId ?? "runtime-1",
    sessionId: overrides.sessionId ?? "session-1",
    sessionName: overrides.sessionName ?? "Test Session",
    state: overrides.state ?? "Completed",
    currentExerciseId: null,
    currentExerciseName: null,
    currentSetIndex: null,
    progress,
    completedExerciseCount: progress.completedExercises,
    skippedExerciseCount: progress.skippedExercises,
    eventCount: overrides.eventCount ?? 10,
    startedAt: overrides.startedAt ?? STARTED_AT,
    pausedAt: null,
  });
}

/**
 * Minimal completed WorkoutResult for unit tests (no runtime engine).
 */
export function createCompletedWorkoutResult(
  overrides: Partial<WorkoutResult> = {},
): WorkoutResult {
  const progress = createProgress(overrides.progress);
  const metrics = createMetrics(overrides.metrics);
  const summary = createSummary(progress, overrides.summary);

  return Object.freeze({
    runtimeId: overrides.runtimeId ?? "runtime-1",
    sessionId: overrides.sessionId ?? "session-1",
    finalState: overrides.finalState ?? "Completed",
    summary,
    progress,
    metrics,
    events: overrides.events ?? Object.freeze([]),
    completedExerciseIds:
      overrides.completedExerciseIds ??
      Object.freeze(["er-squat", "er-bench"]),
    skippedExerciseIds: overrides.skippedExerciseIds ?? Object.freeze([]),
    startedAt: overrides.startedAt ?? STARTED_AT,
    completedAt: overrides.completedAt ?? COMPLETED_AT,
    cancelledAt: overrides.cancelledAt ?? null,
    frozenAt: overrides.frozenAt ?? FIXED_TIMESTAMP,
  });
}

/**
 * Minimal EventStream with set_completed samples for volume/intensity tests.
 */
export function createPerformanceEventStream(
  overrides: Partial<EventStream> & {
    readonly includeSets?: boolean;
  } = {},
): EventStream {
  const includeSets = overrides.includeSets !== false;
  const events = includeSets
    ? Object.freeze([
        Object.freeze({
          id: "evt-1",
          type: "set_completed" as const,
          category: "set" as const,
          severity: "info" as const,
          source: "workout-runtime" as const,
          sequence: 1,
          timestamp: STARTED_AT,
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string | number | boolean>),
          }),
          context: Object.freeze({
            sessionId: "session-1",
            workoutRuntimeId: "runtime-1",
            restRuntimeId: null,
            exerciseRuntimeId: "er-squat",
            setRuntimeId: "set-1",
            athleteId: null,
            dayId: "day-1",
            weekNumber: 1,
          }),
          message: "Set 1 completed",
          payload: Object.freeze({
            workoutRuntimeId: "runtime-1",
            exerciseRuntimeId: "er-squat",
            setRuntimeId: "set-1",
            setIndex: 1,
            weight: 100,
            repetitions: 5,
            rpe: 8,
            rir: 2,
          }),
        }),
        Object.freeze({
          id: "evt-2",
          type: "set_completed" as const,
          category: "set" as const,
          severity: "info" as const,
          source: "workout-runtime" as const,
          sequence: 2,
          timestamp: STARTED_AT,
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string | number | boolean>),
          }),
          context: Object.freeze({
            sessionId: "session-1",
            workoutRuntimeId: "runtime-1",
            restRuntimeId: null,
            exerciseRuntimeId: "er-squat",
            setRuntimeId: "set-2",
            athleteId: null,
            dayId: "day-1",
            weekNumber: 1,
          }),
          message: "Set 2 completed",
          payload: Object.freeze({
            workoutRuntimeId: "runtime-1",
            exerciseRuntimeId: "er-squat",
            setRuntimeId: "set-2",
            setIndex: 2,
            weight: 100,
            repetitions: 5,
            rpe: 8,
            rir: 2,
          }),
        }),
        Object.freeze({
          id: "evt-3",
          type: "exercise_completed" as const,
          category: "exercise" as const,
          severity: "info" as const,
          source: "workout-runtime" as const,
          sequence: 3,
          timestamp: STARTED_AT,
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string | number | boolean>),
          }),
          context: Object.freeze({
            sessionId: "session-1",
            workoutRuntimeId: "runtime-1",
            restRuntimeId: null,
            exerciseRuntimeId: "er-squat",
            setRuntimeId: null,
            athleteId: null,
            dayId: "day-1",
            weekNumber: 1,
          }),
          message: "Exercise completed",
          payload: Object.freeze({
            workoutRuntimeId: "runtime-1",
            exerciseRuntimeId: "er-squat",
            exerciseId: "ex-squat",
            exerciseName: "Back Squat",
            order: 1,
          }),
        }),
        Object.freeze({
          id: "evt-4",
          type: "set_completed" as const,
          category: "set" as const,
          severity: "info" as const,
          source: "workout-runtime" as const,
          sequence: 4,
          timestamp: STARTED_AT,
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string | number | boolean>),
          }),
          context: Object.freeze({
            sessionId: "session-1",
            workoutRuntimeId: "runtime-1",
            restRuntimeId: null,
            exerciseRuntimeId: "er-bench",
            setRuntimeId: "set-3",
            athleteId: null,
            dayId: "day-1",
            weekNumber: 1,
          }),
          message: "Set 1 completed",
          payload: Object.freeze({
            workoutRuntimeId: "runtime-1",
            exerciseRuntimeId: "er-bench",
            setRuntimeId: "set-3",
            setIndex: 1,
            weight: 60,
            repetitions: 8,
            rpe: 7,
            rir: 3,
          }),
        }),
        Object.freeze({
          id: "evt-5",
          type: "set_completed" as const,
          category: "set" as const,
          severity: "info" as const,
          source: "workout-runtime" as const,
          sequence: 5,
          timestamp: STARTED_AT,
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string | number | boolean>),
          }),
          context: Object.freeze({
            sessionId: "session-1",
            workoutRuntimeId: "runtime-1",
            restRuntimeId: null,
            exerciseRuntimeId: "er-bench",
            setRuntimeId: "set-4",
            athleteId: null,
            dayId: "day-1",
            weekNumber: 1,
          }),
          message: "Set 2 completed",
          payload: Object.freeze({
            workoutRuntimeId: "runtime-1",
            exerciseRuntimeId: "er-bench",
            setRuntimeId: "set-4",
            setIndex: 2,
            weight: 60,
            repetitions: 8,
            rpe: 7,
            rir: 3,
          }),
        }),
        Object.freeze({
          id: "evt-6",
          type: "exercise_completed" as const,
          category: "exercise" as const,
          severity: "info" as const,
          source: "workout-runtime" as const,
          sequence: 6,
          timestamp: COMPLETED_AT,
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string | number | boolean>),
          }),
          context: Object.freeze({
            sessionId: "session-1",
            workoutRuntimeId: "runtime-1",
            restRuntimeId: null,
            exerciseRuntimeId: "er-bench",
            setRuntimeId: null,
            athleteId: null,
            dayId: "day-1",
            weekNumber: 1,
          }),
          message: "Exercise completed",
          payload: Object.freeze({
            workoutRuntimeId: "runtime-1",
            exerciseRuntimeId: "er-bench",
            exerciseId: "ex-bench",
            exerciseName: "Bench Press",
            order: 2,
          }),
        }),
      ])
    : Object.freeze([]);

  return Object.freeze({
    id: overrides.id ?? "stream-1",
    sessionId: overrides.sessionId ?? "session-1",
    events: overrides.events ?? events,
    eventCount: overrides.eventCount ?? (overrides.events?.length ?? events.length),
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
    lastEventAt: overrides.lastEventAt ?? COMPLETED_AT,
  });
}
