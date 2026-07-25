import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeGroup } from "../utils/FreezeRecommendationState";
import { groupIdsByCategory } from "../utils/RecommendationHelpers";

/**
 * Deterministic grouping by category — no NL.
 */
export function planGroups(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationGroup[] {
  const byCategory = groupIdsByCategory(recommendations);
  const groups: RecommendationGroup[] = [];
  for (const [category, ids] of byCategory) {
    groups.push(
      freezeGroup({
        id: `group:${category}`,
        category,
        recommendationIds: ids,
        label: category,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  return Object.freeze(
    groups.sort((a, b) => a.category.localeCompare(b.category)),
  );
}
