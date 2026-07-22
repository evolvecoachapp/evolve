import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import { parseTimestamp } from "../utils/formatting";

/**
 * Validate assessment consistency against metrics.
 */
export function validateAssessmentConsistency(
  assessment: RecoveryAssessment,
  metrics: RecoveryMetrics,
): readonly string[] {
  const issues: string[] = [];

  if (assessment.status.level !== metrics.status.level) {
    issues.push("assessment_status_mismatch");
  }
  if (assessment.metrics.fatigue.score !== metrics.fatigue.score) {
    issues.push("assessment_fatigue_mismatch");
  }
  if (parseTimestamp(assessment.assessedAt) === null) {
    issues.push("invalid_timestamp:assessedAt");
  }
  if (!assessment.evidence.sourceId) {
    issues.push("assessment_evidence_missing_source");
  }

  return Object.freeze(issues);
}
