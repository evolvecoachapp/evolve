import type { RecoveryAgentState } from "../models/RecoveryAgentState";
import { freezeAgentState } from "../utils/FreezeRecoveryState";
import type { RecoveryAgentSession } from "./RecoverySession";

export class RecoveryAgentStateManager {
  constructor(private readonly session: RecoveryAgentSession) {}

  update(
    patch: Partial<RecoveryAgentState>,
    clock: () => string,
  ): RecoveryAgentState {
    const next = freezeAgentState({
      ...this.session.getState(),
      ...patch,
      sessionId: this.session.sessionId,
      updatedAt: clock(),
    });
    this.session.setState(next);
    return next;
  }

  get(): RecoveryAgentState {
    return this.session.getState();
  }
}
