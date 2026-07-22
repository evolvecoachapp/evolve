import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import { calculateAdaptationScore } from "../utils/calculateAdaptationScore";
import { normalizeRecommendation } from "../utils/normalizeRecommendations";
import type { AdaptationStrategy } from "./AdaptationStrategy";

/**
 * Recommend volume reduction when fatigue is elevated or recovery is limited.
 * Recommendations only — does not modify workouts.
 */
export class VolumeAdaptationStrategy implements AdaptationStrategy {
  readonly id = "volume_adaptation";

  recommend(
    context: AdaptationContext,
    readiness: ReadinessAssessment,
    plan: ProgressionPlan,
  ): readonly AdaptationRecommendation[] {
    const shouldReduce =
      readiness.fatigue.level === "high" ||
      readiness.fatigue.level === "excessive" ||
      readiness.recovery.status === "limited" ||
      readiness.recovery.status === "insufficient";

    if (!shouldReduce) {
      return Object.freeze([]);
    }

    const magnitude =
      readiness.fatigue.level === "excessive"
        ? 2
        : readiness.fatigue.level === "high"
          ? 1.5
          : 1;

    const primary = plan.exerciseProgressions.find(
      (entry) => entry.role === "primary",
    );
    const targetExerciseId =
      primary?.exerciseId ?? plan.exerciseProgressions[0]?.exerciseId;

    const reason: AdaptationReason = Object.freeze({
      code: "volume_adaptation_recommended",
      weight: magnitude,
      detail: `fatigue_${readiness.fatigue.level}`,
    });

    return Object.freeze([
      normalizeRecommendation({
        id: `volume:${context.progressionRequestId}`,
        strategyId: this.id,
        action: Object.freeze({
          kind: "reduce_volume" as const,
          targetExerciseId,
          targetWeekNumber: 1,
          magnitude,
          priority: 20,
        }),
        reasons: Object.freeze([reason]),
        score: calculateAdaptationScore({ adaptation: magnitude }),
      }),
    ]);
  }
}
