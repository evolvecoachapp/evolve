import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import {
  createCompletedWorkoutResult,
  FIXED_TIMESTAMP,
} from "../../performance-engine/testSupport/fixtures";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { AchievementContext } from "../models/AchievementContext";
import { MapPersonalRecordBaselineProvider } from "../models/PersonalRecordBaseline";
import type { PersonalRecordType } from "../models/PersonalRecordType";

export { FIXED_TIMESTAMP };

export function createAchievementContext(
  overrides: Partial<AchievementContext> = {},
): AchievementContext {
  return Object.freeze({
    sessionId: overrides.sessionId ?? "session-1",
    runtimeId: overrides.runtimeId ?? "runtime-1",
    athleteId: overrides.athleteId ?? null,
    performanceSnapshotId: overrides.performanceSnapshotId ?? "perf-1",
    dayId: overrides.dayId ?? "day-1",
    weekNumber: overrides.weekNumber ?? 1,
    evaluatedAt: overrides.evaluatedAt ?? FIXED_TIMESTAMP,
  });
}

export function createPerformanceSnapshotFixture(
  overrides: {
    readonly maxWeight?: number | null;
    readonly tonnage?: number;
    readonly volumeLoad?: number;
    readonly totalCompletedSets?: number;
    readonly totalCompletedRepetitions?: number;
    readonly tonnagePerMinute?: number | null;
    readonly exercises?: PerformanceSnapshot["exercises"];
  } = {},
): PerformanceSnapshot {
  const tonnage = overrides.tonnage ?? 1960;
  const volumeLoad = overrides.volumeLoad ?? tonnage;
  const totalCompletedSets = overrides.totalCompletedSets ?? 4;
  const totalCompletedRepetitions = overrides.totalCompletedRepetitions ?? 26;
  const maxWeight = overrides.maxWeight === undefined ? 100 : overrides.maxWeight;
  const tonnagePerMinute =
    overrides.tonnagePerMinute === undefined ? 43.556 : overrides.tonnagePerMinute;

  const volume = Object.freeze({
    tonnage,
    volumeLoad,
    totalCompletedSets,
    totalCompletedRepetitions,
    loadedSetCount: totalCompletedSets,
    unloadedSetCount: 0,
  });

  const intensity = Object.freeze({
    averageWeight: maxWeight,
    averageRepetitions: 6.5,
    averageRpe: 7.5,
    averageRir: 2.5,
    maxWeight,
    maxRpe: 8,
    weightSampleCount: totalCompletedSets,
    rpeSampleCount: totalCompletedSets,
    rirSampleCount: totalCompletedSets,
  });

  const density = Object.freeze({
    durationMs: 45 * 60_000,
    durationMinutes: 45,
    tonnagePerMinute,
    setsPerMinute: totalCompletedSets / 45,
    repetitionsPerMinute: totalCompletedRepetitions / 45,
  });

  const completion = Object.freeze({
    totalExercises: 2,
    completedExercises: 2,
    skippedExercises: 0,
    totalSets: totalCompletedSets,
    completedSets: totalCompletedSets,
    skippedSets: 0,
    exerciseCompletionPercent: 100,
    setCompletionPercent: 100,
    workoutCompletionPercent: 100,
  });

  const metrics = Object.freeze({
    volume,
    intensity,
    density,
    completion,
  });

  const exercises =
    overrides.exercises ??
    Object.freeze([
      Object.freeze({
        exerciseRuntimeId: "er-squat",
        exerciseId: "ex-squat",
        exerciseName: "Back Squat",
        order: 1,
        completedSets: 2,
        skipped: false,
        completed: true,
        totalRepetitions: 10,
        tonnage: 1000,
        averageWeight: 100,
        averageRpe: 8,
        averageRir: 2,
      }),
      Object.freeze({
        exerciseRuntimeId: "er-bench",
        exerciseId: "ex-bench",
        exerciseName: "Bench Press",
        order: 2,
        completedSets: 2,
        skipped: false,
        completed: true,
        totalRepetitions: 16,
        tonnage: 960,
        averageWeight: 60,
        averageRpe: 7,
        averageRir: 3,
      }),
    ]);

  return Object.freeze({
    id: "perf-1",
    context: Object.freeze({
      sessionId: "session-1",
      runtimeId: "runtime-1",
      athleteId: null,
      dayId: "day-1",
      weekNumber: 1,
      decisionReportId: null,
      eventStreamId: "stream-1",
      eventCount: 6,
      analyzedAt: FIXED_TIMESTAMP,
    }),
    session: Object.freeze({
      sessionId: "session-1",
      runtimeId: "runtime-1",
      finalState: "Completed" as const,
      grade: "A" as const,
      metrics,
      startedAt: "2026-07-22T10:00:00.000Z",
      completedAt: "2026-07-22T10:45:00.000Z",
      durationMs: 45 * 60_000,
    }),
    metrics,
    exercises,
    movements: Object.freeze([]),
    grade: "A" as const,
    summary: Object.freeze({
      snapshotId: "perf-1",
      sessionId: "session-1",
      runtimeId: "runtime-1",
      grade: "A" as const,
      workoutCompletionPercent: 100,
      tonnage,
      totalCompletedSets,
      totalCompletedRepetitions,
      durationMs: 45 * 60_000,
      summaryText: "Grade A",
    }),
    trend: Object.freeze({
      available: false,
      sessionCount: 1,
      message: "single_session_only",
    }),
    frozenAt: FIXED_TIMESTAMP,
  });
}

export function createWorkoutResultFixture(
  overrides: Partial<WorkoutResult> = {},
): WorkoutResult {
  return createCompletedWorkoutResult(overrides);
}

export function createBaselineProvider(
  baselines: Partial<Record<PersonalRecordType, number>> = {},
  exerciseVolumes: Record<string, number> = {},
): MapPersonalRecordBaselineProvider {
  return new MapPersonalRecordBaselineProvider(baselines, exerciseVolumes);
}

/** Baselines below fixture metrics so every session-level PR unlocks. */
export function createLowBaselineProvider(): MapPersonalRecordBaselineProvider {
  return createBaselineProvider(
    {
      highest_weight: 50,
      highest_volume: 500,
      highest_tonnage: 500,
      highest_repetitions: 10,
      highest_completed_sets: 2,
      highest_density: 10,
      highest_session_volume: 500,
    },
    {
      "ex-squat": 200,
      "ex-bench": 200,
    },
  );
}

/** Baselines above fixture metrics so no PRs unlock. */
export function createHighBaselineProvider(): MapPersonalRecordBaselineProvider {
  return createBaselineProvider(
    {
      highest_weight: 500,
      highest_volume: 50_000,
      highest_tonnage: 50_000,
      highest_repetitions: 10_000,
      highest_completed_sets: 1_000,
      highest_density: 10_000,
      highest_session_volume: 50_000,
    },
    {
      "ex-squat": 50_000,
      "ex-bench": 50_000,
    },
  );
}
