import { evaluateAchievements } from "../application";
import {
  createLowBaselineProvider,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AchievementCategories } from "../models/AchievementCategory";
import { AchievementTypes } from "../models/AchievementType";

describe("achievement-engine regression", () => {
  it("keeps Personal Records as the only unlocked category this sprint", () => {
    const result = evaluateAchievements(
      createPerformanceSnapshotFixture(),
      createWorkoutResultFixture(),
      createLowBaselineProvider(),
      { evaluatedAt: FIXED_TIMESTAMP },
    );

    for (const achievement of result.result.achievements) {
      expect(achievement.type).toBe(AchievementTypes.PERSONAL_RECORD);
      expect(achievement.category).toBe(
        AchievementCategories.PERSONAL_RECORDS,
      );
    }
  });

  it("is deterministic for the same snapshot + baselines", () => {
    const snapshot = createPerformanceSnapshotFixture();
    const workout = createWorkoutResultFixture();
    const baselines = createLowBaselineProvider();

    const a = evaluateAchievements(snapshot, workout, baselines, {
      evaluatedAt: FIXED_TIMESTAMP,
      evaluationId: "eval-fixed",
    });
    const b = evaluateAchievements(snapshot, workout, baselines, {
      evaluatedAt: FIXED_TIMESTAMP,
      evaluationId: "eval-fixed",
    });

    expect(a.result.personalRecords.map((pr) => pr.id)).toEqual(
      b.result.personalRecords.map((pr) => pr.id),
    );
    expect(a.result.events.map((e) => e.id)).toEqual(
      b.result.events.map((e) => e.id),
    );
  });

  it("architecture constants reserve future categories without implementing them", () => {
    expect(AchievementCategories.MILESTONES).toBe("milestones");
    expect(AchievementCategories.BADGES).toBe("badges");
    expect(AchievementCategories.GOALS).toBe("goals");
    expect(AchievementCategories.CHALLENGES).toBe("challenges");
    expect(AchievementCategories.STREAKS).toBe("streaks");
  });
});
