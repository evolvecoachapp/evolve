import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import { calculateAdaptationScore } from "../utils/calculateAdaptationScore";
import { normalizeRecommendation } from "../utils/normalizeRecommendations";
import type { AdaptationStrategy } from "./AdaptationStrategy";

/**
 * Recommend intensity reduction when fatigue is high/excessive.
 * Recommendations only — does not modify workouts.
 */
export class IntensityAdaptationStrategy implements AdaptationStrategy {
  readonly id = "intensity_adaptation";

  recommend(
    context: AdaptationContext,
    readiness: ReadinessAssessment,
    plan: ProgressionPlan,
  ): readonly AdaptationRecommendation[] {
    if (
      readiness.fatigue.level !== "high" &&
      readiness.fatigue.level !== "excessive"
    ) {
      return Object.freeze([]);
    }

    const magnitude = readiness.fatigue.level === "excessive" ? 2 : 1;
    const primary = plan.exerciseProgressions.find(
      (entry) => entry.role === "primary",
    );

    const reason: AdaptationReason = Object.freeze({
      code: "intensity_adaptation_recommended",
      weight: magnitude,
      detail: `peak_intensity_${context.peakIntensityValue}`,
    });

    return Object.freeze([
      normalizeRecommendation({
        id: `intensity:${context.progressionRequestId}`,
        strategyId: this.id,
        action: Object.freeze({
          kind: "reduce_intensity" as const,
          targetExerciseId: primary?.exerciseId,
          targetWeekNumber: 1,
          magnitude,
          priority: 30,
        }),
        reasons: Object.freeze([reason]),
        score: calculateAdaptationScore({ adaptation: magnitude }),
      }),
    ]);
  }
}
