import type { RecoveryAgentMetadata } from "./RecoveryMetadata";
import type { RecoveryAgentSnapshot } from "./RecoveryAgentSnapshot";
import type { RecoveryAgentStatistics } from "./RecoveryStatistics";
import type { RecoveryContext } from "./RecoveryContext";
import type { RecoveryConversation } from "./RecoveryConversation";
import type { RecoveryDecision } from "./RecoveryDecision";
import type { RecoveryExplanation } from "./RecoveryExplanation";
import type { RecoveryReasoning } from "./RecoveryReasoning";
import type { RecoveryRecommendation } from "./RecoveryRecommendation";
import type { RecoveryRequest } from "./RecoveryRequest";
import type { RecoveryValidation } from "./RecoveryValidation";

/**
 * Immutable primary output of the Recovery Agent.
 */
export interface RecoveryAgentResult {
  readonly id: string;
  readonly request: RecoveryRequest;
  readonly context: RecoveryContext;
  readonly conversation: RecoveryConversation;
  readonly reasoning: readonly RecoveryReasoning[];
  readonly decision: RecoveryDecision;
  readonly recommendations: readonly RecoveryRecommendation[];
  readonly explanation: RecoveryExplanation;
  readonly validation: RecoveryValidation;
  readonly snapshot: RecoveryAgentSnapshot;
  readonly statistics: RecoveryAgentStatistics;
  readonly success: boolean;
  readonly message: string | null;
  readonly metadata: RecoveryAgentMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
