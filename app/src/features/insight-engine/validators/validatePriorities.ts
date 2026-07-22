import type { Insight } from "../models/Insight";
import { isValidInsightPriority } from "../models/InsightPriority";

/**
 * Validate priority scores are within 1–100.
 */
export function validatePriorities(
  insights: readonly Insight[],
): readonly string[] {
  const issues: string[] = [];

  for (const insight of insights) {
    if (!isValidInsightPriority(insight.priority)) {
      issues.push(`insight_invalid_priority:${insight.id}`);
    }
  }

  return issues;
}
