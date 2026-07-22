import type { ReadinessAssessment } from "../models/ReadinessAssessment";

/**
 * Validate that nested assessment scores and statuses are internally consistent.
 */
export function validateAssessmentConsistency(
  readiness: ReadinessAssessment,
): readonly string[] {
  const issues: string[] = [];

  if (
    readiness.overallScore < 0 ||
    readiness.overallScore > 100 ||
    readiness.executionConfidence < 0 ||
    readiness.executionConfidence > 100
  ) {
    issues.push("readiness_score_out_of_range");
  }

  if (readiness.recovery.score < 0 || readiness.recovery.score > 100) {
    issues.push("recovery_score_out_of_range");
  }

  if (readiness.fatigue.score < 0 || readiness.fatigue.score > 100) {
    issues.push("fatigue_score_out_of_range");
  }

  if (readiness.constraints.score < 0 || readiness.constraints.score > 100) {
    issues.push("constraint_score_out_of_range");
  }

  if (
    readiness.constraints.hardCount < 0 ||
    readiness.constraints.softCount < 0
  ) {
    issues.push("constraint_count_negative");
  }

  if (
    readiness.constraints.blockingCodes.length !==
    new Set(readiness.constraints.blockingCodes).size
  ) {
    issues.push("constraint_blocking_codes_duplicate");
  }

  if (
    readiness.recovery.status === "adequate" &&
    readiness.recovery.score < 70
  ) {
    issues.push("recovery_status_score_mismatch");
  }

  if (
    readiness.recovery.status === "insufficient" &&
    readiness.recovery.score >= 40
  ) {
    issues.push("recovery_status_score_mismatch");
  }

  return Object.freeze(issues);
}
