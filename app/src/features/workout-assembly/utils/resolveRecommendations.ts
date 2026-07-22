import type { AdaptationRecommendation } from "../../training-adaptation/models/AdaptationRecommendation";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";

/**
 * Resolve adaptation recommendations applicable to the assembled week.
 * Sorted by action.priority ascending, then id ascending.
 * Does not invent new recommendations.
 */
export function resolveRecommendations(
  request: WorkoutAssemblyRequest,
  weekNumber: number,
): readonly AdaptationRecommendation[] {
  const applicable = request.adaptation.recommendations.filter(
    (recommendation) => {
      const targetWeek = recommendation.action.targetWeekNumber;
      if (targetWeek !== undefined && targetWeek !== weekNumber) {
        return false;
      }
      return recommendation.action.kind !== "maintain";
    },
  );

  return Object.freeze(
    [...applicable].sort((left, right) => {
      if (left.action.priority !== right.action.priority) {
        return left.action.priority - right.action.priority;
      }
      return left.id.localeCompare(right.id);
    }),
  );
}
