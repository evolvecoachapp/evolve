import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import {
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  FIXED_TIMESTAMP as ACH_TS,
} from "../../achievement-engine/testSupport/fixtures";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { HistoryContext } from "../models/HistoryContext";
import { HistoryEntryCategories } from "../models/HistoryEntryCategory";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import type { HistoryEntry } from "../models/HistoryEntry";
import { HistoryEntryBuilder } from "../builders/HistoryEntryBuilder";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

export { createPerformanceSnapshotFixture, createWorkoutResultFixture };

export function createHistoryContext(
  overrides: Partial<HistoryContext> = {},
): HistoryContext {
  return Object.freeze({
    athleteId: overrides.athleteId ?? null,
    sessionId: overrides.sessionId ?? "session-1",
    runtimeId: overrides.runtimeId ?? "runtime-1",
    dayId: overrides.dayId ?? "day-1",
    weekNumber: overrides.weekNumber ?? 1,
    eventStreamId: overrides.eventStreamId ?? "stream-1",
    performanceSnapshotId: overrides.performanceSnapshotId ?? "perf-1",
    achievementEvaluationId: overrides.achievementEvaluationId ?? "ach:eval-1",
    builtAt: overrides.builtAt ?? FIXED_TIMESTAMP,
  });
}

export function createHistoryEntryFixture(
  overrides: Partial<{
    readonly id: string;
    readonly type: string;
    readonly category: string;
    readonly occurredAt: string;
    readonly title: string;
  }> = {},
): HistoryEntry {
  return new HistoryEntryBuilder()
    .withId(overrides.id ?? "hist:entry:1")
    .withType(overrides.type ?? HistoryEntryTypes.WORKOUT)
    .withCategory(overrides.category ?? HistoryEntryCategories.TRAINING)
    .withOccurredAt(overrides.occurredAt ?? FIXED_TIMESTAMP)
    .withTitle(overrides.title ?? "Test entry")
    .withDescription("Fixture history entry")
    .withReferences(
      Object.freeze([
        Object.freeze({
          kind: "workout_runtime",
          id: "runtime-1",
          label: "WorkoutRuntime",
        }),
      ]),
    )
    .withEvidence(
      Object.freeze({
        sourceType: "Fixture",
        sourceId: overrides.id ?? "hist:entry:1",
        attributes: Object.freeze({}),
      }),
    )
    .withContext(createHistoryContext())
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

export function createAchievementResultFixture(
  overrides: {
    readonly unlockedCount?: number;
    readonly unlockedAt?: string;
  } = {},
): AchievementResult {
  const unlockedAt = overrides.unlockedAt ?? ACH_TS;
  const unlockedCount = overrides.unlockedCount ?? 2;

  const achievements = Object.freeze(
    Array.from({ length: unlockedCount }, (_, i) =>
      Object.freeze({
        id: `ach-${i + 1}`,
        type: "personal_record",
        category: "personal_records",
        level: "standard",
        status: "unlocked" as const,
        title: `PR ${i + 1}`,
        description: `Personal record ${i + 1}`,
        reason: "surpassed_baseline",
        rule: Object.freeze({
          id: `rule-${i + 1}`,
          type: "personal_record",
          category: "personal_records",
          description: "PR rule",
          comparison: "greater_than" as const,
          metricKey: "tonnage",
        }),
        evidence: Object.freeze({
          metricKey: "tonnage",
          currentValue: 1960 + i,
          previousValue: 1000,
          unit: "kg·reps",
          attributes: Object.freeze({}),
        }),
        context: Object.freeze({
          sessionId: "session-1",
          runtimeId: "runtime-1",
          athleteId: null,
          performanceSnapshotId: "perf-1",
          dayId: "day-1",
          weekNumber: 1,
          evaluatedAt: unlockedAt,
        }),
        metadata: Object.freeze({
          tags: Object.freeze(["personal_record"]),
          attributes: Object.freeze({}),
        }),
        unlockedAt,
        frozenAt: unlockedAt,
      }),
    ),
  );

  return Object.freeze({
    evaluationId: "ach:eval-1",
    performanceSnapshotId: "perf-1",
    sessionId: "session-1",
    runtimeId: "runtime-1",
    achievements,
    personalRecords: Object.freeze([]),
    events: Object.freeze([]),
    unlockedCount: achievements.length,
    evaluatedAt: unlockedAt,
    frozenAt: unlockedAt,
  });
}

export function createFullBuildInputs(): {
  readonly workoutResult: WorkoutResult;
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly achievementResult: AchievementResult;
} {
  return Object.freeze({
    workoutResult: createWorkoutResultFixture(),
    performanceSnapshot: createPerformanceSnapshotFixture(),
    achievementResult: createAchievementResultFixture(),
  });
}
