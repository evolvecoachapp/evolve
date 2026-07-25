import type { RecommendationAction } from "./RecommendationAction";
import type { RecommendationCategory } from "./RecommendationCategory";
import type { RecommendationConfidence } from "./RecommendationConfidence";
import type { RecommendationConstraint } from "./RecommendationConstraint";
import type { RecommendationDependency } from "./RecommendationDependency";
import type { RecommendationIntent } from "./RecommendationIntent";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationPriority } from "./RecommendationPriority";
import type { RecommendationSequence } from "./RecommendationSequence";
import type { RecommendationTarget } from "./RecommendationTarget";
import type { RecommendationType } from "./RecommendationType";

/**
 * Immutable coaching recommendation — structured output only.
 * No AI. No NL. No domain calculations. No action execution.
 */
export interface CoachingRecommendation {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisionId: string;
  readonly category: RecommendationCategory;
  readonly intent: RecommendationIntent;
  readonly type: RecommendationType;
  readonly title: string;
  readonly priority: RecommendationPriority;
  readonly confidence: RecommendationConfidence;
  readonly actions: readonly RecommendationAction[];
  readonly sequence: RecommendationSequence | null;
  readonly constraints: readonly RecommendationConstraint[];
  readonly dependencies: readonly RecommendationDependency[];
  readonly targets: readonly RecommendationTarget[];
  readonly sourceKeys: readonly string[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
