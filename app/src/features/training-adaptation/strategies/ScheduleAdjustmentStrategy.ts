import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import { calculateAdaptationScore } from "../utils/calculateAdaptationScore";
import { normalizeRecommendation } from "../utils/normalizeRecommendations";
import type { AdaptationStrategy } from "./AdaptationStrategy";

/**
 * Recommend schedule adjustment when frequency and fatigue pressure are high.
 * Recommendations only — does not modify workouts.
 */
export class ScheduleAdjustmentStrategy implements AdaptationStrategy {
  readonly id = "schedule_adjustment";

  recommend(
    context: AdaptationContext,
    readiness: ReadinessAssessment,
    _plan: ProgressionPlan,
  ): readonly AdaptationRecommendation[] {
    const highFrequency = context.weeklyFrequency >= 5;
    const elevatedFatigue =
      readiness.fatigue.level === "high" ||
      readiness.fatigue.level === "excessive";

    if (!highFrequency || !elevatedFatigue) {
      return Object.freeze([]);
    }

    const magnitude = context.weeklyFrequency - 4;

    const reason: AdaptationReason = Object.freeze({
      code: "schedule_adjustment_recommended",
      weight: magnitude,
      detail: `frequency_${context.weeklyFrequency}`,
    });

    return Object.freeze([
      normalizeRecommendation({
        id: `schedule:${context.progressionRequestId}`,
        strategyId: this.id,
        action: Object.freeze({
          kind: "adjust_schedule" as const,
          magnitude,
          priority: 50,
        }),
        reasons: Object.freeze([reason]),
        score: calculateAdaptationScore({ adaptation: magnitude }),
      }),
    ]);
  }
}
