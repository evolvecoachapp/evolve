import type { NutritionAgentStatus } from "./NutritionAgentStatus";

/**
 * Mutable-session immutable snapshot of agent state.
 */
export interface NutritionAgentState {
  readonly sessionId: string;
  readonly status: NutritionAgentStatus;
  readonly requestId: string | null;
  readonly contextId: string | null;
  readonly decisionId: string | null;
  readonly errorMessage: string | null;
  readonly updatedAt: string;
}
