import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import { RecommendationDependencyKinds } from "../models/RecommendationDependency";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeDependency } from "../utils/FreezeRecommendationState";

/**
 * Deterministic dependency planning from recommendation links.
 */
export function planDependencies(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationDependency[] {
  const deps: RecommendationDependency[] = [];
  const byCategory = new Map<string, CoachingRecommendation>();
  for (const r of recommendations) {
    byCategory.set(r.category, r);
  }
  const safety = byCategory.get("safety");
  const training = byCategory.get("training");
  if (safety && training) {
    deps.push(
      freezeDependency({
        id: `dep:${safety.id}->${training.id}`,
        kind: RecommendationDependencyKinds.BLOCKS,
        fromId: safety.id,
        toId: training.id,
        required: true,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  const recovery = byCategory.get("recovery");
  if (recovery && training) {
    deps.push(
      freezeDependency({
        id: `dep:${recovery.id}->${training.id}`,
        kind: RecommendationDependencyKinds.FOLLOWS,
        fromId: recovery.id,
        toId: training.id,
        required: false,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  for (const r of recommendations) {
    for (const d of r.dependencies) {
      deps.push(freezeDependency(d));
    }
  }
  return Object.freeze(deps);
}
