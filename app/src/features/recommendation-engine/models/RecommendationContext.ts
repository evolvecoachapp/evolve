import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationReference } from "./RecommendationReference";

/**
 * Immutable recommendation context — derived from Decision Engine handoff.
 */
export interface RecommendationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly references: readonly RecommendationReference[];
  readonly focusAreas: readonly string[];
  readonly athletePresent: boolean;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
