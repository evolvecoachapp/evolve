/**
 * Machine-readable reason for unlock / rejection.
 * Open string type for future reasons without model changes.
 */
export type AchievementReason = string;

export const AchievementReasons = {
  SURPASSED_BASELINE: "surpassed_baseline",
  FIRST_RECORDED_VALUE: "first_recorded_value",
  DUPLICATE_ACHIEVEMENT: "duplicate_achievement",
  INVALID_CATEGORY: "invalid_category",
  EVIDENCE_INCONSISTENT: "evidence_inconsistent",
  RULE_INCONSISTENT: "rule_inconsistent",
  METADATA_INVALID: "metadata_invalid",
  NO_COMPARABLE_VALUE: "no_comparable_value",
  BELOW_OR_EQUAL_BASELINE: "below_or_equal_baseline",
} as const satisfies Record<string, AchievementReason>;
