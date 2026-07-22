import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import { calculateAdaptationScore } from "../utils/calculateAdaptationScore";
import { normalizeRecommendation } from "../utils/normalizeRecommendations";
import type { AdaptationStrategy } from "./AdaptationStrategy";

/**
 * Recommend an exercise swap when hard constraints block execution freedom.
 * Recommendations only — does not modify workouts.
 */
export class ExerciseSwapStrategy implements AdaptationStrategy {
  readonly id = "exercise_swap";

  recommend(
    context: AdaptationContext,
    readiness: ReadinessAssessment,
    plan: ProgressionPlan,
  ): readonly AdaptationRecommendation[] {
    if (readiness.constraints.hardCount === 0) {
      return Object.freeze([]);
    }

    const blocked = readiness.constraints.blockingCodes[0] ?? "hard_constraint";
    const accessory = plan.exerciseProgressions.find(
      (entry) => entry.role === "accessory",
    );
    const targetExerciseId =
      accessory?.exerciseId ?? plan.exerciseProgressions[0]?.exerciseId;

    const reason: AdaptationReason = Object.freeze({
      code: "exercise_swap_recommended",
      weight: readiness.constraints.hardCount,
      detail: `blocking_${blocked}`,
    });

    return Object.freeze([
      normalizeRecommendation({
        id: `swap:${context.progressionRequestId}:${blocked}`,
        strategyId: this.id,
        action: Object.freeze({
          kind: "swap_exercise" as const,
          targetExerciseId,
          magnitude: readiness.constraints.hardCount,
          priority: 40,
        }),
        reasons: Object.freeze([reason]),
        score: calculateAdaptationScore({
          constraints: readiness.constraints.hardCount,
          adaptation: 1,
        }),
      }),
    ]);
  }
}
