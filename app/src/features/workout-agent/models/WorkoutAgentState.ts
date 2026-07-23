import type { WorkoutAgentStatus } from "./WorkoutAgentStatus";

/**
 * Mutable-looking but frozen session state snapshot.
 */
export interface WorkoutAgentState {
  readonly sessionId: string;
  readonly status: WorkoutAgentStatus;
  readonly requestId: string | null;
  readonly contextId: string | null;
  readonly decisionId: string | null;
  readonly errorMessage: string | null;
  readonly updatedAt: string;
}
