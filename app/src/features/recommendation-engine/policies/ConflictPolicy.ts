import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import { RecommendationConflictKinds } from "../models/RecommendationConflict";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeConflict } from "../utils/FreezeRecommendationState";

/**
 * Deterministic conflict policy — safety escalate vs training act.
 */
export function applyConflictPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationConflict[] {
  const conflicts: RecommendationConflict[] = [];
  const safety = recommendations.find(
    (r) => r.category === "safety" && r.intent === "escalate",
  );
  const training = recommendations.find((r) => r.category === "training");
  if (safety && training) {
    conflicts.push(
      freezeConflict({
        id: "conflict:safety-vs-training",
        kind: RecommendationConflictKinds.MUTUAL_EXCLUSION,
        leftId: safety.id,
        rightId: training.id,
        description: "Safety escalate conflicts with training act",
        resolved: false,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  const byCategory = new Map<string, CoachingRecommendation[]>();
  for (const r of recommendations) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }
  for (const [category, list] of byCategory) {
    if (list.length < 2) continue;
    conflicts.push(
      freezeConflict({
        id: `conflict:${category}:duplicate`,
        kind: RecommendationConflictKinds.PRIORITY,
        leftId: list[0]!.id,
        rightId: list[1]!.id,
        description: `Priority conflict in ${category}`,
        resolved: false,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  return Object.freeze(conflicts);
}
