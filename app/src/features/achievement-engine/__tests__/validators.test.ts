import { PersonalRecordBuilder } from "../builders";
import { AchievementCategories } from "../models/AchievementCategory";
import { AchievementReasons } from "../models/AchievementReason";
import { AchievementTypes } from "../models/AchievementType";
import { PersonalRecordTypes } from "../models/PersonalRecordType";
import {
  createAchievementContext,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import {
  validateAchievementIntegrity,
  validateDuplicates,
  validateEvidenceConsistency,
  validateMetadata,
  validateRuleConsistency,
} from "../validators";

function createValidPersonalRecord() {
  return new PersonalRecordBuilder()
    .withId("pr-1")
    .withPersonalRecordType(PersonalRecordTypes.HIGHEST_WEIGHT)
    .withReason(AchievementReasons.SURPASSED_BASELINE)
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
}

describe("achievement-engine validators", () => {
  it("accepts a valid personal record", () => {
    const pr = createValidPersonalRecord();
    expect(validateAchievementIntegrity(pr)).toHaveLength(0);
    expect(validateEvidenceConsistency(pr)).toHaveLength(0);
    expect(validateRuleConsistency(pr)).toHaveLength(0);
    expect(validateMetadata(pr.metadata)).toHaveLength(0);
  });

  it("flags invalid category", () => {
    const pr = createValidPersonalRecord();
    const broken = Object.freeze({
      ...pr,
      category: "unknown_category",
    });
    expect(validateAchievementIntegrity(broken)).toContain(
      "invalid_category:unknown_category",
    );
  });

  it("flags evidence that does not surpass baseline", () => {
    const pr = createValidPersonalRecord();
    const broken = Object.freeze({
      ...pr,
      evidence: Object.freeze({
        ...pr.evidence,
        currentValue: 80,
        previousValue: 90,
      }),
    });
    expect(validateEvidenceConsistency(broken)).toContain(
      "evidence_does_not_surpass_baseline",
    );
  });

  it("flags rule metric mismatch", () => {
    const pr = createValidPersonalRecord();
    const broken = Object.freeze({
      ...pr,
      rule: Object.freeze({ ...pr.rule, metricKey: "other" }),
    });
    expect(validateRuleConsistency(broken)).toContain(
      "rule_metric_key_mismatch",
    );
  });

  it("flags duplicate achievements", () => {
    const pr = createValidPersonalRecord();
    expect(validateDuplicates([pr, pr])).toEqual([
      `duplicate_achievement:${[
        pr.type,
        pr.category,
        pr.rule.id,
        "",
        pr.evidence.metricKey,
      ].join("|")}`,
    ]);
  });
});
