import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import type { TrainingConstraint } from "../models/TrainingConstraint";

/**
 * Validate that recommendations remain compatible with hard constraints.
 */
export function validateConstraintCompatibility(
  constraints: readonly TrainingConstraint[],
  readiness: ReadinessAssessment,
  recommendations: readonly AdaptationRecommendation[],
): readonly string[] {
  const issues: string[] = [];
  const hardCodes = new Set(
    constraints
      .filter((constraint) => constraint.severity === "hard")
      .map((constraint) => constraint.code),
  );

  if (readiness.constraints.hardCount !== hardCodes.size) {
    // hardCount may include duplicates from blueprint+progression; compare blocking codes instead
    if (
      readiness.constraints.blockingCodes.some((code) => !hardCodes.has(code))
    ) {
      issues.push("constraint_blocking_code_unknown");
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.action.kind === "swap_exercise" &&
      readiness.constraints.hardCount === 0
    ) {
      issues.push("swap_without_hard_constraint");
    }
  }

  return Object.freeze(issues);
}
