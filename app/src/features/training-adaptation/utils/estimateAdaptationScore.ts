import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { AdaptationScore } from "../models/AdaptationScore";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import { calculateAdaptationScore } from "./calculateAdaptationScore";

/**
 * Estimate aggregate adaptation score from readiness + recommendations.
 */
export function estimateAdaptationScore(
  readiness: ReadinessAssessment,
  recommendations: readonly AdaptationRecommendation[],
): AdaptationScore {
  const adaptationMagnitude = recommendations.reduce(
    (sum, recommendation) => sum + recommendation.action.magnitude,
    0,
  );

  return calculateAdaptationScore({
    readiness: readiness.overallScore / 10,
    recovery: readiness.recovery.score / 10,
    fatigue: readiness.fatigue.score / 10,
    constraints: readiness.constraints.score / 10,
    adaptation: Math.round(adaptationMagnitude * 1000) / 1000,
  });
}
