import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";
import type { WorkoutAgentSnapshot } from "./WorkoutAgentSnapshot";
import type { WorkoutAgentStatistics } from "./WorkoutAgentStatistics";
import type { WorkoutContext } from "./WorkoutContext";
import type { WorkoutConversation } from "./WorkoutConversation";
import type { WorkoutDecision } from "./WorkoutDecision";
import type { WorkoutExplanation } from "./WorkoutExplanation";
import type { WorkoutReasoning } from "./WorkoutReasoning";
import type { WorkoutRecommendation } from "./WorkoutRecommendation";
import type { WorkoutRequest } from "./WorkoutRequest";
import type { WorkoutValidation } from "./WorkoutValidation";

/**
 * Immutable primary output of the Workout Agent.
 */
export interface WorkoutAgentResult {
  readonly id: string;
  readonly request: WorkoutRequest;
  readonly context: WorkoutContext;
  readonly conversation: WorkoutConversation;
  readonly reasoning: readonly WorkoutReasoning[];
  readonly decision: WorkoutDecision;
  readonly recommendations: readonly WorkoutRecommendation[];
  readonly explanation: WorkoutExplanation;
  readonly validation: WorkoutValidation;
  readonly snapshot: WorkoutAgentSnapshot;
  readonly statistics: WorkoutAgentStatistics;
  readonly success: boolean;
  readonly message: string | null;
  readonly metadata: WorkoutAgentMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
