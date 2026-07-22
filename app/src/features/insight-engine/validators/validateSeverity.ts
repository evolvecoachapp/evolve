import type { Insight } from "../models/Insight";
import { INSIGHT_SEVERITY_ORDER } from "../models/InsightSeverity";

/**
 * Validate severity values are known observational levels.
 */
export function validateSeverity(
  insights: readonly Insight[],
): readonly string[] {
  const issues: string[] = [];
  const allowed = new Set(INSIGHT_SEVERITY_ORDER);

  for (const insight of insights) {
    if (!allowed.has(insight.severity)) {
      issues.push(`insight_invalid_severity:${insight.id}`);
    }
  }

  return issues;
}
