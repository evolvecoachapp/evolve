import {
  createAchievementInsightGenerator,
  createHistoryInsightGenerator,
  createPerformanceInsightGenerator,
  createRecoveryInsightGenerator,
  createSummaryInsightGenerator,
} from "../generators";
import { InsightTypes } from "../models/InsightType";
import {
  createAchievementResultFixture,
  createAthleteHistoryFixture,
  createFullInsightInputs,
  createPerformanceSnapshotFixture,
  createRecoverySnapshotFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("insight generators", () => {
  it("PerformanceInsightGenerator emits grade/volume/completion facts", () => {
    const insights = createPerformanceInsightGenerator().generate({
      performanceSnapshot: createPerformanceSnapshotFixture(),
      generatedAt: FIXED_TIMESTAMP,
    });
    expect(insights.every((i) => i.type === InsightTypes.PERFORMANCE)).toBe(
      true,
    );
    expect(insights.length).toBe(3);
    expect(insights.some((i) => i.statement.includes("grade"))).toBe(true);
  });

  it("AchievementInsightGenerator emits unlock and PR counts", () => {
    const insights = createAchievementInsightGenerator().generate({
      achievementResult: createAchievementResultFixture(),
      generatedAt: FIXED_TIMESTAMP,
    });
    expect(insights.every((i) => i.type === InsightTypes.ACHIEVEMENT)).toBe(
      true,
    );
    expect(insights.length).toBe(2);
  });

  it("RecoveryInsightGenerator emits status/fatigue/window facts", () => {
    const insights = createRecoveryInsightGenerator().generate({
      recoverySnapshot: createRecoverySnapshotFixture(),
      generatedAt: FIXED_TIMESTAMP,
    });
    expect(insights.every((i) => i.type === InsightTypes.RECOVERY)).toBe(true);
    expect(insights.length).toBe(3);
  });

  it("HistoryInsightGenerator emits count and composition facts", () => {
    const insights = createHistoryInsightGenerator().generate({
      athleteHistory: createAthleteHistoryFixture(),
      generatedAt: FIXED_TIMESTAMP,
    });
    expect(insights.every((i) => i.type === InsightTypes.HISTORY)).toBe(true);
    expect(insights.length).toBe(2);
  });

  it("SummaryInsightGenerator aggregates domain insight counts", () => {
    const inputs = createFullInsightInputs();
    const domain = [
      ...createPerformanceInsightGenerator().generate({
        performanceSnapshot: inputs.performanceSnapshot,
        generatedAt: FIXED_TIMESTAMP,
      }),
      ...createAchievementInsightGenerator().generate({
        achievementResult: inputs.achievementResult,
        generatedAt: FIXED_TIMESTAMP,
      }),
    ];
    const summary = createSummaryInsightGenerator().generate({
      insights: domain,
      snapshotId: "insight:summary-test",
      generatedAt: FIXED_TIMESTAMP,
    });
    expect(summary).toHaveLength(1);
    expect(summary[0].type).toBe(InsightTypes.SUMMARY);
    expect(summary[0].statement).toContain("domain insight");
  });
});
