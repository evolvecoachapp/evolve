import type { AdaptationCandidate } from "./AdaptationCandidate";
import type { AdaptationCategory } from "./AdaptationCategory";
import type { AdaptationCondition } from "./AdaptationCondition";
import type { AdaptationConstraint } from "./AdaptationConstraint";
import type { AdaptationDependency } from "./AdaptationDependency";
import type { AdaptationEvaluation } from "./AdaptationEvaluation";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationOpportunity } from "./AdaptationOpportunity";
import type { AdaptationPriority } from "./AdaptationPriority";
import type { AdaptationReason } from "./AdaptationReason";
import type { AdaptationSeverity } from "./AdaptationSeverity";
import type { AdaptationTrigger } from "./AdaptationTrigger";

/**
 * Primary Continuous Adaptation Engine output.
 * Adaptation detection only — never modifies plans.
 */
export interface AdaptationDecision {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: AdaptationCategory;
  readonly triggers: readonly AdaptationTrigger[];
  readonly conditions: readonly AdaptationCondition[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
  readonly reasons: readonly AdaptationReason[];
  readonly evaluation: AdaptationEvaluation;
  readonly priority: AdaptationPriority;
  readonly severity: AdaptationSeverity;
  readonly dependencies: readonly AdaptationDependency[];
  readonly constraints: readonly AdaptationConstraint[];
  readonly signalKeys: readonly string[];
  readonly sourceKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
