import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import type { TrainingConstraint } from "../models/TrainingConstraint";
import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import { validateAdaptationOrdering } from "./validateAdaptationOrdering";
import { validateAssessmentConsistency } from "./validateAssessmentConsistency";
import { validateConstraintCompatibility } from "./validateConstraintCompatibility";
import { validateRecommendationConsistency } from "./validateRecommendationConsistency";

/**
 * Run the full training adaptation validation suite and return unique issue codes.
 */
export function validateTrainingAdaptationResult(
  request: TrainingAdaptationRequest,
  readiness: ReadinessAssessment,
  recommendations: readonly AdaptationRecommendation[],
  constraints: readonly TrainingConstraint[],
): readonly string[] {
  const issues = [
    ...validateProgressionPresent(request),
    ...validateAssessmentConsistency(readiness),
    ...validateRecommendationConsistency(recommendations),
    ...validateConstraintCompatibility(constraints, readiness, recommendations),
    ...validateAdaptationOrdering(recommendations),
  ];
  return Object.freeze([...new Set(issues)]);
}

function validateProgressionPresent(
  request: TrainingAdaptationRequest,
): readonly string[] {
  if (request.progression.exerciseProgressions.length === 0) {
    return Object.freeze(["progression_empty"]);
  }
  return Object.freeze([]);
}

export { validateAssessmentConsistency } from "./validateAssessmentConsistency";
export { validateRecommendationConsistency } from "./validateRecommendationConsistency";
export { validateConstraintCompatibility } from "./validateConstraintCompatibility";
export { validateAdaptationOrdering } from "./validateAdaptationOrdering";
