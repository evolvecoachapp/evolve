import { createAchievementEvents } from "../events";
import { AchievementEventTypes } from "../models/AchievementEvent";
import { PersonalRecordBuilder } from "../builders";
import { AchievementCategories } from "../models/AchievementCategory";
import { AchievementTypes } from "../models/AchievementType";
import { PersonalRecordTypes } from "../models/PersonalRecordType";
import {
  createAchievementContext,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("achievement-engine events", () => {
  it("emits achievement_unlocked and personal_record_unlocked", () => {
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

    const events = createAchievementEvents([pr]);
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe(AchievementEventTypes.ACHIEVEMENT_UNLOCKED);
    expect(events[1].type).toBe(
      AchievementEventTypes.PERSONAL_RECORD_UNLOCKED,
    );
    expect(Object.isFrozen(events[0])).toBe(true);
    expect(Object.isFrozen(events[1].payload)).toBe(true);
  });

  it("skips non-unlocked achievements", () => {
    const pr = new PersonalRecordBuilder()
      .withId("pr-dup")
      .withPersonalRecordType(PersonalRecordTypes.HIGHEST_WEIGHT)
      .withStatus("duplicate")
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

    expect(createAchievementEvents([pr])).toHaveLength(0);
  });
});
