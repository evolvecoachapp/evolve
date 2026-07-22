import {
  buildAthleteHistory,
  createHistorySnapshot,
  summarizeHistory,
} from "../application";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import {
  createAchievementResultFixture,
  createFullBuildInputs,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("athlete-history application API", () => {
  it("builds immutable AthleteHistory with chronological entries", () => {
    const inputs = createFullBuildInputs();
    const result = buildAthleteHistory({
      ...inputs,
      builtAt: FIXED_TIMESTAMP,
      historyId: "hist-test-1",
    });

    expect(result.history.entryCount).toBeGreaterThan(0);
    expect(result.snapshot.historyId).toBe(result.history.id);
    expect(result.summary.entryCount).toBe(result.history.entryCount);
    expect(Object.isFrozen(result.history)).toBe(true);
    expect(Object.isFrozen(result.history.entries[0])).toBe(true);

    for (let i = 1; i < result.history.entries.length; i++) {
      expect(
        result.history.entries[i - 1].occurredAt <=
          result.history.entries[i].occurredAt,
      ).toBe(true);
    }
  });

  it("createHistorySnapshot freezes a snapshot from history", () => {
    const { history } = buildAthleteHistory({
      ...createFullBuildInputs(),
      builtAt: FIXED_TIMESTAMP,
    });
    const snapshot = createHistorySnapshot(history, {
      snapshotId: "snap-1",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(snapshot.id).toBe("snap-1");
    expect(snapshot.historyId).toBe(history.id);
    expect(snapshot.entryCount).toBe(history.entryCount);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it("summarizeHistory returns public summary", () => {
    const { history } = buildAthleteHistory({
      ...createFullBuildInputs(),
      builtAt: FIXED_TIMESTAMP,
    });
    const summary = summarizeHistory(history);
    expect(summary.historyId).toBe(history.id);
    expect(summary.summaryText).toContain("history");
  });

  it("supports partial inputs (workout only)", () => {
    const result = buildAthleteHistory({
      workoutResult: createWorkoutResultFixture(),
      builtAt: FIXED_TIMESTAMP,
    });
    expect(result.history.entries).toHaveLength(1);
    expect(result.history.entries[0].type).toBe(HistoryEntryTypes.WORKOUT);
  });

  it("aggregates achievements into separate entries", () => {
    const result = buildAthleteHistory({
      workoutResult: createWorkoutResultFixture(),
      performanceSnapshot: createPerformanceSnapshotFixture(),
      achievementResult: createAchievementResultFixture({ unlockedCount: 3 }),
      builtAt: FIXED_TIMESTAMP,
    });
    const achievements = result.history.entries.filter(
      (e) => e.type === HistoryEntryTypes.ACHIEVEMENT,
    );
    expect(achievements).toHaveLength(3);
  });

  it("does not expose engine internals on the public result", () => {
    const result = buildAthleteHistory({
      ...createFullBuildInputs(),
      builtAt: FIXED_TIMESTAMP,
    });
    expect(result).toHaveProperty("history");
    expect(result).toHaveProperty("snapshot");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("validationIssues");
    expect(result).not.toHaveProperty("engine");
    expect(result).not.toHaveProperty("aggregators");
  });
});
