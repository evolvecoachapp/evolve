import type { RecoveryAgentStatus } from "./RecoveryAgentStatus";

export interface RecoveryAgentState {
  readonly sessionId: string;
  readonly status: RecoveryAgentStatus;
  readonly requestId: string | null;
  readonly contextId: string | null;
  readonly decisionId: string | null;
  readonly errorMessage: string | null;
  readonly updatedAt: string;
}
