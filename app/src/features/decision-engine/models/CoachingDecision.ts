import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionConfidence } from "./DecisionConfidence";
  import type { DecisionConstraint } from "./DecisionConstraint";
  import type { DecisionDependency } from "./DecisionDependency";
  import type { DecisionIntent } from "./DecisionIntent";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionOutcome } from "./DecisionOutcome";
  import type { DecisionPriority } from "./DecisionPriority";
  import type { DecisionReason } from "./DecisionReason";
  import type { DecisionRecommendationReference } from "./DecisionRecommendationReference";
  import type { DecisionScore } from "./DecisionScore";

/**
 * Immutable coaching decision — orchestration output only.
 * No AI. No NL. No domain calculations. No action execution.
 */
export interface CoachingDecision {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: DecisionCategory;
  readonly intent: DecisionIntent;
  readonly outcome: DecisionOutcome;
  readonly title: string;
  readonly priority: DecisionPriority;
  readonly confidence: DecisionConfidence;
  readonly score: DecisionScore;
  readonly reasons: readonly DecisionReason[];
  readonly constraints: readonly DecisionConstraint[];
  readonly dependencies: readonly DecisionDependency[];
  readonly recommendationRefs: readonly DecisionRecommendationReference[];
  readonly sourceKeys: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
