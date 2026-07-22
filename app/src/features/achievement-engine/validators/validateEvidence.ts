import type { Achievement } from "../models/Achievement";
import type { PersonalRecord } from "../models/PersonalRecord";
import { AchievementTypes } from "../models/AchievementType";

/**
 * Validate evidence consistency against achievement status/reason.
 */
export function validateEvidenceConsistency(
  achievement: Achievement,
): readonly string[] {
  const issues: string[] = [];
  const { evidence } = achievement;

  if (!evidence.metricKey) {
    issues.push("evidence_missing_metric_key");
  }
  if (!Number.isFinite(evidence.currentValue)) {
    issues.push("evidence_current_value_not_finite");
  }
  if (
    evidence.previousValue != null &&
    !Number.isFinite(evidence.previousValue)
  ) {
    issues.push("evidence_previous_value_not_finite");
  }
  if (
    achievement.status === "unlocked" &&
    evidence.previousValue != null &&
    evidence.currentValue <= evidence.previousValue
  ) {
    issues.push("evidence_does_not_surpass_baseline");
  }
  if (
    achievement.type === AchievementTypes.PERSONAL_RECORD &&
    !("personalRecordType" in achievement)
  ) {
    issues.push("personal_record_missing_type");
  }
  if (achievement.type === AchievementTypes.PERSONAL_RECORD) {
    const pr = achievement as PersonalRecord;
    if (pr.evidence.personalRecordType !== pr.personalRecordType) {
      issues.push("personal_record_evidence_type_mismatch");
    }
  }

  return Object.freeze(issues);
}
