import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationCategory } from "../models/RecommendationCategory";

export function sortRecommendationsByPriority(
  items: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.priority.ordinal !== b.priority.ordinal) {
        return a.priority.ordinal - b.priority.ordinal;
      }
      if (a.priority.urgency !== b.priority.urgency) {
        return b.priority.urgency - a.priority.urgency;
      }
      return a.id.localeCompare(b.id);
    }),
  );
}

export function groupIdsByCategory(
  items: readonly CoachingRecommendation[],
): ReadonlyMap<RecommendationCategory, readonly string[]> {
  const map = new Map<RecommendationCategory, string[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item.id);
    map.set(item.category, list);
  }
  const frozen = new Map<RecommendationCategory, readonly string[]>();
  for (const [k, v] of map) {
    frozen.set(k, Object.freeze([...v]));
  }
  return frozen;
}

export function recommendationIds(
  items: readonly CoachingRecommendation[],
): readonly string[] {
  return Object.freeze(items.map((r) => r.id));
}
