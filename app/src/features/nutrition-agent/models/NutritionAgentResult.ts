import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionAgentSnapshot } from "./NutritionAgentSnapshot";
import type { NutritionAgentStatistics } from "./NutritionStatistics";
import type { NutritionContext } from "./NutritionContext";
import type { NutritionConversation } from "./NutritionConversation";
import type { NutritionDecision } from "./NutritionDecision";
import type { NutritionDomainInvocation } from "./NutritionDomainInvocation";
import type { NutritionExplanation } from "./NutritionExplanation";
import type { NutritionReasoning } from "./NutritionReasoning";
import type { NutritionRecommendation } from "./NutritionRecommendation";
import type { NutritionRequest } from "./NutritionRequest";
import type { NutritionValidation } from "./NutritionValidation";

/**
 * Immutable primary output of the Nutrition Agent.
 */
export interface NutritionAgentResult {
  readonly id: string;
  readonly request: NutritionRequest;
  readonly context: NutritionContext;
  readonly conversation: NutritionConversation;
  readonly reasoning: readonly NutritionReasoning[];
  readonly decision: NutritionDecision;
  readonly recommendations: readonly NutritionRecommendation[];
  readonly explanation: NutritionExplanation;
  readonly validation: NutritionValidation;
  readonly snapshot: NutritionAgentSnapshot;
  readonly statistics: NutritionAgentStatistics;
  readonly domainInvocations: readonly NutritionDomainInvocation[];
  readonly success: boolean;
  readonly message: string | null;
  readonly metadata: NutritionAgentMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
