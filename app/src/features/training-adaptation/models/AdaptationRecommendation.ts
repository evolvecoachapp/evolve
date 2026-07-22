import type { AdaptationAction } from "./AdaptationAction";
import type { AdaptationReason } from "./AdaptationReason";
import type { AdaptationScore } from "./AdaptationScore";

/**
 * Immutable adaptation recommendation produced by a strategy.
 * Does not modify workouts — recommendation only.
 */
export interface AdaptationRecommendation {
  readonly id: string;
  readonly action: AdaptationAction;
  readonly reasons: readonly AdaptationReason[];
  readonly score: AdaptationScore;
  readonly strategyId: string;
}
