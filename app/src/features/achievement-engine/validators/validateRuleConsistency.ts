import type { Achievement } from "../models/Achievement";

/**
 * Validate rule fields align with achievement type/category/evidence.
 */
export function validateRuleConsistency(
  achievement: Achievement,
): readonly string[] {
  const issues: string[] = [];
  const { rule, evidence } = achievement;

  if (!rule.id) {
    issues.push("rule_missing_id");
  }
  if (rule.type !== achievement.type) {
    issues.push("rule_type_mismatch");
  }
  if (rule.category !== achievement.category) {
    issues.push("rule_category_mismatch");
  }
  if (rule.comparison !== "greater_than") {
    issues.push("rule_unsupported_comparison");
  }
  if (rule.metricKey !== evidence.metricKey) {
    issues.push("rule_metric_key_mismatch");
  }

  return Object.freeze(issues);
}
