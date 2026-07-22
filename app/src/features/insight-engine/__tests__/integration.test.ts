import { buildAthleteHistory } from "../../athlete-history/application";
import {
  createAchievementResultFixture,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
} from "../../athlete-history/testSupport/fixtures";
import { analyzeRecovery } from "../../recovery-intelligence/application";
import { generateInsights } from "../application";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("insight-engine integration", () => {
  it("consumes Performance + Achievement + Recovery + Athlete History", () => {
    const workoutResult = createWorkoutResultFixture();
    const performanceSnapshot = createPerformanceSnapshotFixture({
      tonnage: 2500,
    });
    const achievementResult = createAchievementResultFixture();

    const historyResult = buildAthleteHistory({
      workoutResult,
      performanceSnapshot,
      achievementResult,
      builtAt: FIXED_TIMESTAMP,
      historyId: "hist:insight-integration",
    });

    const recovery = analyzeRecovery({
      athleteHistory: historyResult.history,
      performanceSnapshot,
      workoutResult,
      achievementResult,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv:insight-integration",
    });

    const insights = generateInsights({
      performanceSnapshot,
      achievementResult,
      recoverySnapshot: recovery.snapshot,
      athleteHistory: historyResult.history,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight:integration",
    });

    expect(insights.snapshot.context.historyId).toBe(
      "hist:insight-integration",
    );
    expect(insights.snapshot.context.performanceSnapshotId).toBe(
      performanceSnapshot.id,
    );
    expect(insights.snapshot.context.recoverySnapshotId).toBe(
      "recv:insight-integration",
    );
    expect(insights.snapshot.context.achievementEvaluationId).toBe(
      achievementResult.evaluationId,
    );
    expect(
      insights.collection.insights.some((i) =>
        i.statement.includes("2500"),
      ),
    ).toBe(true);
  });

  it("does not mutate upstream domain snapshots", () => {
    const workoutResult = createWorkoutResultFixture();
    const performanceSnapshot = createPerformanceSnapshotFixture();
    const achievementResult = createAchievementResultFixture();
    const historyResult = buildAthleteHistory({
      workoutResult,
      performanceSnapshot,
      achievementResult,
      builtAt: FIXED_TIMESTAMP,
    });
    const recovery = analyzeRecovery({
      athleteHistory: historyResult.history,
      performanceSnapshot,
      workoutResult,
      achievementResult,
      analyzedAt: FIXED_TIMESTAMP,
    });

    const before = {
      performance: JSON.stringify(performanceSnapshot),
      achievement: JSON.stringify(achievementResult),
      recovery: JSON.stringify(recovery.snapshot),
      history: JSON.stringify(historyResult.history),
    };

    generateInsights({
      performanceSnapshot,
      achievementResult,
      recoverySnapshot: recovery.snapshot,
      athleteHistory: historyResult.history,
      generatedAt: FIXED_TIMESTAMP,
    });

    expect(JSON.stringify(performanceSnapshot)).toBe(before.performance);
    expect(JSON.stringify(achievementResult)).toBe(before.achievement);
    expect(JSON.stringify(recovery.snapshot)).toBe(before.recovery);
    expect(JSON.stringify(historyResult.history)).toBe(before.history);
  });
});
