import type { AdaptationReason } from "./AdaptationReason";
import type { AdaptationScore } from "./AdaptationScore";

/**
 * Machine-readable explanation for why an adaptation was recommended.
 */
export interface AdaptationExplanation {
  readonly recommendationId: string;
  readonly summaryCode: string;
  readonly reasons: readonly AdaptationReason[];
  readonly score: AdaptationScore;
}
