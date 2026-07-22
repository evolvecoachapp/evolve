import type { AdaptationRecommendation } from "../../training-adaptation/models/AdaptationRecommendation";
import type { WorkoutExercise } from "../models/WorkoutExercise";

/**
 * Validate that applied adaptation recommendation ids are consistent.
 */
export function validateAdaptationConsistency(
  exercises: readonly WorkoutExercise[],
  recommendations: readonly AdaptationRecommendation[],
): readonly string[] {
  const issues: string[] = [];
  const knownIds = new Set(recommendations.map((entry) => entry.id));

  for (const exercise of exercises) {
    for (const recommendationId of exercise.appliedRecommendationIds) {
      if (!knownIds.has(recommendationId)) {
        issues.push(
          `adaptation_unknown_recommendation:${exercise.id}:${recommendationId}`,
        );
      }
    }
  }

  return Object.freeze(issues);
}
