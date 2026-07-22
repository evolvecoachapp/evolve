import type { Insight } from "../models/Insight";

/**
 * Validate that each insight has non-empty evidence attribution.
 */
export function validateEvidence(
  insights: readonly Insight[],
): readonly string[] {
  const issues: string[] = [];

  for (const insight of insights) {
    if (!insight.evidence.sourceType) {
      issues.push(`insight_missing_evidence_source_type:${insight.id}`);
    }
    if (!insight.evidence.sourceId) {
      issues.push(`insight_missing_evidence_source_id:${insight.id}`);
    }
  }

  return issues;
}
