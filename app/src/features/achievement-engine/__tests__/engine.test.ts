import {
  detectPersonalRecords,
  evaluateAchievements,
  summarizeAchievements,
} from "../application";
import {
  createHighBaselineProvider,
  createLowBaselineProvider,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { MapPersonalRecordBaselineProvider } from "../models/PersonalRecordBaseline";

describe("achievement-engine application API", () => {
  it("evaluates achievements into an immutable result with events", () => {
    const result = evaluateAchievements(
      createPerformanceSnapshotFixture(),
      createWorkoutResultFixture(),
      createLowBaselineProvider(),
      { evaluatedAt: FIXED_TIMESTAMP },
    );

    expect(result.result.unlockedCount).toBeGreaterThan(0);
    expect(result.result.personalRecords.length).toBeGreaterThan(0);
    expect(result.result.events.length).toBeGreaterThan(0);
    expect(result.summary.unlockedCount).toBe(result.result.unlockedCount);
    expect(Object.isFrozen(result.result)).toBe(true);
    expect(Object.isFrozen(result.result.achievements[0])).toBe(true);
  });

  it("detectPersonalRecords returns PR-only result", () => {
    const prResult = detectPersonalRecords(
      createPerformanceSnapshotFixture(),
      createWorkoutResultFixture(),
      createLowBaselineProvider(),
      { evaluatedAt: FIXED_TIMESTAMP },
    );

    expect(prResult.detectedCount).toBe(prResult.personalRecords.length);
    expect(
      prResult.personalRecords.every((pr) => pr.type === "personal_record"),
    ).toBe(true);
  });

  it("summarizeAchievements returns public summary", () => {
    const { result } = evaluateAchievements(
      createPerformanceSnapshotFixture(),
      createWorkoutResultFixture(),
      createLowBaselineProvider(),
      { evaluatedAt: FIXED_TIMESTAMP },
    );
    const summary = summarizeAchievements(result);
    expect(summary.evaluationId).toBe(result.evaluationId);
    expect(summary.summaryText).toContain("unlocked");
  });

  it("unlocks no PRs when baselines are higher", () => {
    const result = evaluateAchievements(
      createPerformanceSnapshotFixture(),
      createWorkoutResultFixture(),
      createHighBaselineProvider(),
      { evaluatedAt: FIXED_TIMESTAMP },
    );
    expect(result.result.unlockedCount).toBe(0);
    expect(result.result.events).toHaveLength(0);
  });

  it("treats missing baseline as first recorded value", () => {
    const result = evaluateAchievements(
      createPerformanceSnapshotFixture(),
      createWorkoutResultFixture(),
      new MapPersonalRecordBaselineProvider({}, {}),
      { evaluatedAt: FIXED_TIMESTAMP },
    );
    expect(result.result.unlockedCount).toBeGreaterThan(0);
    expect(
      result.result.personalRecords.some(
        (pr) => pr.reason === "first_recorded_value",
      ),
    ).toBe(true);
  });

  it("does not expose engine internals on the public result", () => {
    const result = evaluateAchievements(
      createPerformanceSnapshotFixture(),
      createWorkoutResultFixture(),
      createLowBaselineProvider(),
    );
    expect(result).toHaveProperty("result");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("validationIssues");
    expect(result).not.toHaveProperty("engine");
    expect(result).not.toHaveProperty("detectors");
  });
});
