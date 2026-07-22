import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import { buildAthleteHistory } from "../../athlete-history/application";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import {
  createAchievementResultFixture,
  createFullBuildInputs,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
} from "../../athlete-history/testSupport/fixtures";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import { analyzeRecovery } from "../../recovery-intelligence/application";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import { InsightBuilder } from "../builders/InsightBuilder";
import type { Insight } from "../models/Insight";
import { InsightCategories } from "../models/InsightCategory";
import type { InsightContext } from "../models/InsightContext";
import { InsightSeverities } from "../models/InsightSeverity";
import { InsightTypes } from "../models/InsightType";
import { aggregateInsights } from "../utils/aggregateInsights";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

export {
  createAchievementResultFixture,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
};

export function createAthleteHistoryFixture(
  overrides: {
    readonly performanceSnapshot?: PerformanceSnapshot;
    readonly workoutResult?: WorkoutResult;
    readonly achievementResult?: AchievementResult;
    readonly builtAt?: string;
    readonly historyId?: string;
  } = {},
): AthleteHistory {
  const inputs = createFullBuildInputs();
  const result = buildAthleteHistory({
    workoutResult: overrides.workoutResult ?? inputs.workoutResult,
    performanceSnapshot:
      overrides.performanceSnapshot ?? inputs.performanceSnapshot,
    achievementResult: overrides.achievementResult ?? inputs.achievementResult,
    builtAt: overrides.builtAt ?? FIXED_TIMESTAMP,
    historyId: overrides.historyId ?? "hist:insight-fixture",
  });
  return result.history;
}

export function createRecoverySnapshotFixture(
  overrides: {
    readonly performanceSnapshot?: PerformanceSnapshot;
    readonly athleteHistory?: AthleteHistory;
    readonly workoutResult?: WorkoutResult;
    readonly achievementResult?: AchievementResult;
    readonly analyzedAt?: string;
    readonly snapshotId?: string;
  } = {},
): RecoverySnapshot {
  const performanceSnapshot =
    overrides.performanceSnapshot ?? createPerformanceSnapshotFixture();
  const workoutResult = overrides.workoutResult ?? createWorkoutResultFixture();
  const achievementResult =
    overrides.achievementResult ?? createAchievementResultFixture();
  const athleteHistory =
    overrides.athleteHistory ??
    createAthleteHistoryFixture({
      performanceSnapshot,
      workoutResult,
      achievementResult,
    });

  return analyzeRecovery({
    athleteHistory,
    performanceSnapshot,
    workoutResult,
    achievementResult,
    analyzedAt: overrides.analyzedAt ?? FIXED_TIMESTAMP,
    snapshotId: overrides.snapshotId ?? "recv:insight-fixture",
  }).snapshot;
}

export function createInsightContext(
  overrides: Partial<InsightContext> = {},
): InsightContext {
  return Object.freeze({
    athleteId: overrides.athleteId ?? null,
    sessionId: overrides.sessionId ?? "session-1",
    runtimeId: overrides.runtimeId ?? "runtime-1",
    dayId: overrides.dayId ?? "day-1",
    weekNumber: overrides.weekNumber ?? 1,
    performanceSnapshotId: overrides.performanceSnapshotId ?? "perf-1",
    achievementEvaluationId:
      overrides.achievementEvaluationId ?? "ach-eval-1",
    recoverySnapshotId: overrides.recoverySnapshotId ?? "recv:insight-fixture",
    historyId: overrides.historyId ?? "hist:insight-fixture",
    generatedAt: overrides.generatedAt ?? FIXED_TIMESTAMP,
  });
}

export function createInsightFixture(
  overrides: Partial<Insight> & { readonly id?: string } = {},
): Insight {
  return new InsightBuilder()
    .withId(overrides.id ?? "insight:fixture:1")
    .withType(overrides.type ?? InsightTypes.PERFORMANCE)
    .withCategory(overrides.category ?? InsightCategories.GRADE)
    .withSeverity(overrides.severity ?? InsightSeverities.INFO)
    .withPriority(overrides.priority ?? 50)
    .withStatus(overrides.status ?? "active")
    .withTitle(overrides.title ?? "Fixture insight")
    .withStatement(overrides.statement ?? "Fixture statement.")
    .withReason(
      overrides.reason ??
        Object.freeze({
          code: "fixture_reason",
          statement: "Fixture reason",
          attributes: Object.freeze({}),
        }),
    )
    .withEvidence(
      overrides.evidence ??
        Object.freeze({
          sourceType: "PerformanceSnapshot",
          sourceId: "perf-1",
          attributes: Object.freeze({}),
        }),
    )
    .withMetadata(
      overrides.metadata ??
        Object.freeze({
          tags: Object.freeze(["fixture"]),
          attributes: Object.freeze({}),
        }),
    )
    .withGeneratedAt(overrides.generatedAt ?? FIXED_TIMESTAMP)
    .withFrozenAt(overrides.frozenAt ?? FIXED_TIMESTAMP)
    .build();
}

export function createInsightCollectionFixture(
  insights: readonly Insight[] = [createInsightFixture()],
) {
  return aggregateInsights(insights);
}

export function createFullInsightInputs(): {
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly achievementResult: AchievementResult;
  readonly recoverySnapshot: RecoverySnapshot;
  readonly athleteHistory: AthleteHistory;
  readonly workoutResult: WorkoutResult;
} {
  const performanceSnapshot = createPerformanceSnapshotFixture();
  const workoutResult = createWorkoutResultFixture();
  const achievementResult = createAchievementResultFixture();
  const athleteHistory = createAthleteHistoryFixture({
    performanceSnapshot,
    workoutResult,
    achievementResult,
  });
  const recoverySnapshot = createRecoverySnapshotFixture({
    performanceSnapshot,
    athleteHistory,
    workoutResult,
    achievementResult,
  });

  return Object.freeze({
    performanceSnapshot,
    achievementResult,
    recoverySnapshot,
    athleteHistory,
    workoutResult,
  });
}
