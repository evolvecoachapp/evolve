import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import { calculateAdaptationScore } from "../utils/calculateAdaptationScore";
import { normalizeRecommendation } from "../utils/normalizeRecommendations";
import type { AdaptationStrategy } from "./AdaptationStrategy";

/**
 * Recommend inserting a recovery day when recovery is insufficient.
 * Recommendations only — does not modify workouts.
 */
export class RecoveryDayStrategy implements AdaptationStrategy {
  readonly id = "recovery_day";

  recommend(
    context: AdaptationContext,
    readiness: ReadinessAssessment,
    _plan: ProgressionPlan,
  ): readonly AdaptationRecommendation[] {
    if (readiness.recovery.status !== "insufficient") {
      return Object.freeze([]);
    }

    const magnitude = Math.max(1, Math.round((100 - readiness.recovery.score) / 25));

    const reason: AdaptationReason = Object.freeze({
      code: "recovery_day_recommended",
      weight: magnitude,
      detail: `recovery_${readiness.recovery.status}`,
    });

    return Object.freeze([
      normalizeRecommendation({
        id: `recovery_day:${context.progressionRequestId}`,
        strategyId: this.id,
        action: Object.freeze({
          kind: "insert_recovery_day" as const,
          targetWeekNumber: Math.max(1, Math.ceil(context.weekCount / 2)),
          magnitude,
          priority: 10,
        }),
        reasons: Object.freeze([reason]),
        score: calculateAdaptationScore({
          recovery: magnitude,
          adaptation: magnitude,
        }),
      }),
    ]);
  }
}
