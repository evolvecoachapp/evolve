import {
  AchievementBuilder,
  AchievementSummaryBuilder,
  PersonalRecordBuilder,
} from "../builders";
import { AchievementCategories } from "../models/AchievementCategory";
import { AchievementReasons } from "../models/AchievementReason";
import { AchievementTypes } from "../models/AchievementType";
import { PersonalRecordTypes } from "../models/PersonalRecordType";
import {
  createAchievementContext,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("achievement-engine builders", () => {
  it("PersonalRecordBuilder produces frozen personal records", () => {
    const pr = new PersonalRecordBuilder()
      .withId("pr-1")
      .withPersonalRecordType(PersonalRecordTypes.HIGHEST_TONNAGE)
      .withReason(AchievementReasons.FIRST_RECORDED_VALUE)
      .withRule(
        Object.freeze({
          id: "pr:highest_tonnage",
          type: AchievementTypes.PERSONAL_RECORD,
          category: AchievementCategories.PERSONAL_RECORDS,
          description: "Detect highest_tonnage",
          comparison: "greater_than" as const,
          metricKey: "tonnage",
        }),
      )
      .withEvidence(
        Object.freeze({
          metricKey: "tonnage",
          currentValue: 1960,
          previousValue: null,
          unit: "kg·reps",
          personalRecordType: PersonalRecordTypes.HIGHEST_TONNAGE,
          exerciseId: null,
          exerciseRuntimeId: null,
          attributes: Object.freeze({}),
        }),
      )
      .withContext(createAchievementContext())
      .withUnlockedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(pr.category).toBe(AchievementCategories.PERSONAL_RECORDS);
    expect(Object.isFrozen(pr)).toBe(true);
    expect(Object.isFrozen(pr.evidence)).toBe(true);
  });

  it("AchievementBuilder requires core fields", () => {
    expect(() => new AchievementBuilder().build()).toThrow(
      /missing required fields/,
    );
  });

  it("AchievementSummaryBuilder summarizes unlocked achievements", () => {
    const pr = new PersonalRecordBuilder()
      .withId("pr-1")
      .withPersonalRecordType(PersonalRecordTypes.HIGHEST_WEIGHT)
      .withRule(
        Object.freeze({
          id: "pr:highest_weight",
          type: AchievementTypes.PERSONAL_RECORD,
          category: AchievementCategories.PERSONAL_RECORDS,
          description: "Detect highest_weight",
          comparison: "greater_than" as const,
          metricKey: "maxWeight",
        }),
      )
      .withEvidence(
        Object.freeze({
          metricKey: "maxWeight",
          currentValue: 100,
          previousValue: 90,
          unit: "kg",
          personalRecordType: PersonalRecordTypes.HIGHEST_WEIGHT,
          exerciseId: null,
          exerciseRuntimeId: null,
          attributes: Object.freeze({}),
        }),
      )
      .withContext(createAchievementContext())
      .withUnlockedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    const summary = new AchievementSummaryBuilder()
      .fromAchievements("eval-1", "session-1", "runtime-1", [pr])
      .build();

    expect(summary.unlockedCount).toBe(1);
    expect(summary.personalRecordCount).toBe(1);
    expect(summary.categories).toContain("personal_records");
  });
});
