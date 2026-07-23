import type { RecoveryAgentState } from "../models/RecoveryAgentState";
import { RecoveryAgentStatuses } from "../models/RecoveryAgentStatus";
import { freezeAgentState } from "../utils/FreezeRecoveryState";

export class RecoveryAgentSession {
  private state: RecoveryAgentState;

  constructor(
    readonly sessionId: string,
    clock: () => string = () => new Date().toISOString(),
  ) {
    this.state = freezeAgentState({
      sessionId,
      status: RecoveryAgentStatuses.IDLE,
      requestId: null,
      contextId: null,
      decisionId: null,
      errorMessage: null,
      updatedAt: clock(),
    });
  }

  getState(): RecoveryAgentState {
    return this.state;
  }

  setState(state: RecoveryAgentState): void {
    this.state = freezeAgentState(state);
  }
}
