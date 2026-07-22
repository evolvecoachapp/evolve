import {
  AchievementAggregator,
  HistoryStatisticsAggregator,
  PerformanceAggregator,
  SummaryAggregator,
  WorkoutAggregator,
} from "../aggregators";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import {
  createAchievementResultFixture,
  createHistoryContext,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("athlete-history aggregators", () => {
  const context = createHistoryContext();

  it("WorkoutAggregator maps WorkoutResult to workout entry", () => {
    const entry = new WorkoutAggregator().aggregate(
      createWorkoutResultFixture(),
      context,
      FIXED_TIMESTAMP,
    );
    expect(entry.type).toBe(HistoryEntryTypes.WORKOUT);
    expect(entry.runtimeId).toBe("runtime-1");
    expect(Object.isFrozen(entry)).toBe(true);
  });

  it("PerformanceAggregator maps PerformanceSnapshot to performance entry", () => {
    const entry = new PerformanceAggregator().aggregate(
      createPerformanceSnapshotFixture(),
      context,
      FIXED_TIMESTAMP,
    );
    expect(entry.type).toBe(HistoryEntryTypes.PERFORMANCE);
    expect(entry.performanceSnapshotId).toBe("perf-1");
    expect(entry.tonnage).toBeGreaterThan(0);
  });

  it("AchievementAggregator emits one entry per unlocked achievement", () => {
    const entries = new AchievementAggregator().aggregate(
      createAchievementResultFixture({ unlockedCount: 2 }),
      context,
      FIXED_TIMESTAMP,
    );
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.type === HistoryEntryTypes.ACHIEVEMENT)).toBe(
      true,
    );
  });

  it("HistoryStatisticsAggregator counts by type and category", () => {
    const workout = new WorkoutAggregator().aggregate(
      createWorkoutResultFixture(),
      context,
      FIXED_TIMESTAMP,
    );
    const performance = new PerformanceAggregator().aggregate(
      createPerformanceSnapshotFixture(),
      context,
      FIXED_TIMESTAMP,
    );
    const stats = new HistoryStatisticsAggregator().aggregate([
      workout,
      performance,
    ]);
    expect(stats.totalEntries).toBe(2);
    expect(stats.byType.workout).toBe(1);
    expect(stats.byType.performance).toBe(1);
    expect(stats.sessionCount).toBe(1);
  });

  it("SummaryAggregator builds summary text", () => {
    const workout = new WorkoutAggregator().aggregate(
      createWorkoutResultFixture(),
      context,
      FIXED_TIMESTAMP,
    );
    const summary = new SummaryAggregator().aggregate("hist-1", null, [
      workout,
    ]);
    expect(summary.historyId).toBe("hist-1");
    expect(summary.workoutCount).toBe(1);
    expect(summary.summaryText).toContain("1 history entry");
  });
});
