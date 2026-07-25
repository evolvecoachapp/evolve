import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { RecommendationEngineInput } from "../../decision-engine/models/RecommendationEngineInput";
import type { RecommendationContext } from "./RecommendationContext";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { CoachingRecommendation } from "./CoachingRecommendation";

export const RecommendationInputKinds = {
  BUILD: "build",
  PRIORITIZE: "prioritize",
  PACKAGE: "package",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type RecommendationInputKind =
  (typeof RecommendationInputKinds)[keyof typeof RecommendationInputKinds];

/**
 * Immutable input for Recommendation Engine operations.
 */
export interface RecommendationInput {
  readonly id: string;
  readonly kind: RecommendationInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly recommendationContext: RecommendationContext | null;
  readonly decisionHandoff: RecommendationEngineInput | null;
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly reason: string;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
