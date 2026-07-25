import type { ExplanationConfidence } from "./ExplanationConfidence";
import type { ExplanationContextReference } from "./ExplanationContextReference";
import type { ExplanationDecisionLink } from "./ExplanationDecisionLink";
import type { ExplanationEvidence } from "./ExplanationEvidence";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationPriority } from "./ExplanationPriority";
import type { ExplanationReason } from "./ExplanationReason";
import type { ExplanationRecommendationLink } from "./ExplanationRecommendationLink";
import type { ExplanationSection } from "./ExplanationSection";

/**
 * Immutable coaching explanation — structured WHY only.
 * No AI. No NL. No domain calculations. Never changes decisions.
 */
export interface CoachingExplanation {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly recommendationId: string;
  readonly decisionId: string;
  readonly reasons: readonly ExplanationReason[];
  readonly evidence: readonly ExplanationEvidence[];
  readonly sections: readonly ExplanationSection[];
  readonly confidence: ExplanationConfidence;
  readonly priority: ExplanationPriority;
  readonly decisionLink: ExplanationDecisionLink;
  readonly recommendationLink: ExplanationRecommendationLink;
  readonly contextReference: ExplanationContextReference;
  readonly sourceKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
