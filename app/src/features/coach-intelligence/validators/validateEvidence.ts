import type { CoachEvidence } from "../models/CoachEvidence";

/**
 * Soft-validate evidence attribution.
 */
export function validateEvidence(
  evidence: readonly CoachEvidence[],
): readonly string[] {
  const issues: string[] = [];

  for (const item of evidence) {
    if (!item.id) {
      issues.push("evidence_missing_id");
    }
    if (!item.sourceType) {
      issues.push(`evidence_missing_source_type:${item.id || "unknown"}`);
    }
    if (!item.sourceId) {
      issues.push(`evidence_missing_source_id:${item.id || "unknown"}`);
    }
    if (!item.statement) {
      issues.push(`evidence_missing_statement:${item.id || "unknown"}`);
    }
  }

  return issues;
}
