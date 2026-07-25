import type { RecommendationCategory } from "./RecommendationCategory";

/**
 * Immutable priority stamp — fixed ordinal tables only (no heuristics).
 */
export interface RecommendationPriority {
  readonly category: RecommendationCategory;
  readonly ordinal: number;
  readonly urgency: number;
  readonly label: string;
}

/** Fixed category priority: lower ordinal = higher priority. */
export const DEFAULT_RECOMMENDATION_PRIORITIES: readonly RecommendationPriority[] =
  Object.freeze([
    Object.freeze({
      category: "safety" as const,
      ordinal: 0,
      urgency: 100,
      label: "safety",
    }),
    Object.freeze({
      category: "recovery" as const,
      ordinal: 1,
      urgency: 80,
      label: "recovery",
    }),
    Object.freeze({
      category: "training" as const,
      ordinal: 2,
      urgency: 70,
      label: "training",
    }),
    Object.freeze({
      category: "nutrition" as const,
      ordinal: 3,
      urgency: 60,
      label: "nutrition",
    }),
    Object.freeze({
      category: "goal" as const,
      ordinal: 4,
      urgency: 50,
      label: "goal",
    }),
    Object.freeze({
      category: "lifestyle" as const,
      ordinal: 5,
      urgency: 40,
      label: "lifestyle",
    }),
    Object.freeze({
      category: "orchestration" as const,
      ordinal: 6,
      urgency: 30,
      label: "orchestration",
    }),
  ]);

export function priorityForCategory(
  category: RecommendationCategory,
): RecommendationPriority {
  const found = DEFAULT_RECOMMENDATION_PRIORITIES.find(
    (p) => p.category === category,
  );
  return (
    found ??
    Object.freeze({
      category,
      ordinal: 99,
      urgency: 0,
      label: category,
    })
  );
}
