import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Opaque reference for Recommendation Engine handoff — no NL, no execution.
 */
export interface DecisionRecommendationReference {
  readonly id: string;
  readonly decisionId: string;
  readonly category: DecisionCategory;
  readonly priorityOrdinal: number;
  readonly intent: string;
  readonly metadata: DecisionMetadata;
}
