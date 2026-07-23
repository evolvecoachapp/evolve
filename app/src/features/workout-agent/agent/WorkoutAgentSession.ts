import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import type { WorkoutAgentState } from "../models/WorkoutAgentState";
import { WorkoutAgentStatuses } from "../models/WorkoutAgentStatus";
import { freezeAgentState } from "../utils/freezeAgentState";

export class WorkoutAgentSession {
  private state: WorkoutAgentState;

  constructor(
    readonly id: string,
    clock: () => string = () => new Date().toISOString(),
  ) {
    this.state = freezeAgentState({
      sessionId: id,
      status: WorkoutAgentStatuses.IDLE,
      requestId: null,
      contextId: null,
      decisionId: null,
      errorMessage: null,
      updatedAt: clock(),
    });
  }

  getState(): WorkoutAgentState {
    return this.state;
  }

  transition(
    patch: Partial<Omit<WorkoutAgentState, "sessionId">>,
    clock: () => string,
  ): WorkoutAgentState {
    this.state = freezeAgentState({
      ...this.state,
      ...patch,
      sessionId: this.id,
      updatedAt: clock(),
    });
    return this.state;
  }
}

export { EMPTY_WORKOUT_AGENT_METADATA };
