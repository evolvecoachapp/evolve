import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";

/**
 * Independent adaptation strategy.
 * Receives immutable context + readiness and returns recommendations only.
 * Strategies never modify workouts and never coordinate with each other.
 */
export interface AdaptationStrategy {
  readonly id: string;
  recommend(
    context: AdaptationContext,
    readiness: ReadinessAssessment,
    plan: ProgressionPlan,
  ): readonly AdaptationRecommendation[];
}
