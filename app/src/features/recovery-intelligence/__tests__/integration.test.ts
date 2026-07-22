import { buildAthleteHistory } from "../../athlete-history/application";
import {
  createAchievementResultFixture,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
} from "../../athlete-history/testSupport/fixtures";
import { analyzeRecovery } from "../application";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("recovery-intelligence integration", () => {
  it("consumes Athlete History + Performance Snapshot + optional WorkoutResult", () => {
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
      historyId: "hist:integration",
    });

    const recovery = analyzeRecovery({
      athleteHistory: historyResult.history,
      performanceSnapshot,
      workoutResult,
      achievementResult,
      analyzedAt: FIXED_TIMESTAMP,
      snapshotId: "recv:integration",
    });

    expect(recovery.snapshot.context.historyId).toBe("hist:integration");
    expect(recovery.snapshot.context.performanceSnapshotId).toBe(
      performanceSnapshot.id,
    );
    expect(recovery.snapshot.context.runtimeId).toBe(workoutResult.runtimeId);
    expect(recovery.snapshot.metrics.trainingLoad.sessionLoad).toBe(2500);
    expect(recovery.validationIssues).not.toContain(
      "workout_performance_runtime_mismatch",
    );
  });

  it("does not mutate upstream history or performance snapshot", () => {
    const workoutResult = createWorkoutResultFixture();
    const performanceSnapshot = createPerformanceSnapshotFixture();
    const historyResult = buildAthleteHistory({
      workoutResult,
      performanceSnapshot,
      builtAt: FIXED_TIMESTAMP,
    });

    const historyBefore = JSON.stringify(historyResult.history);
    const snapshotBefore = JSON.stringify(performanceSnapshot);

    analyzeRecovery({
      athleteHistory: historyResult.history,
      performanceSnapshot,
      workoutResult,
      analyzedAt: FIXED_TIMESTAMP,
    });

    expect(JSON.stringify(historyResult.history)).toBe(historyBefore);
    expect(JSON.stringify(performanceSnapshot)).toBe(snapshotBefore);
  });
});
