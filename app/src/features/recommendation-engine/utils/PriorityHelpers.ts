import type { RecommendationPriority } from "../models/RecommendationPriority";
import { DEFAULT_RECOMMENDATION_PRIORITIES } from "../models/RecommendationPriority";

export function comparePriority(
  a: RecommendationPriority,
  b: RecommendationPriority,
): number {
  if (a.ordinal !== b.ordinal) return a.ordinal - b.ordinal;
  return b.urgency - a.urgency;
}

export function defaultOrdinalForCategory(category: string): number {
  const found = DEFAULT_RECOMMENDATION_PRIORITIES.find(
    (p) => p.category === category,
  );
  return found?.ordinal ?? 99;
}
