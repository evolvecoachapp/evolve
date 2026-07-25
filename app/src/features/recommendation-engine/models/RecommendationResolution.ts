import type { RecommendationMetadata } from "./RecommendationMetadata";

export const RecommendationResolutionStrategies = {
  KEEP_LEFT: "keep_left",
  KEEP_RIGHT: "keep_right",
  KEEP_HIGHER_PRIORITY: "keep_higher_priority",
  ORDER_BOTH: "order_both",
  DEFER_BOTH: "defer_both",
} as const;

export type RecommendationResolutionStrategy =
  (typeof RecommendationResolutionStrategies)[keyof typeof RecommendationResolutionStrategies];

export interface RecommendationResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly strategy: RecommendationResolutionStrategy;
  readonly winnerId: string | null;
  readonly loserIds: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: RecommendationMetadata;
}
