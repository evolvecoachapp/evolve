import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import type { NutritionAgentState } from "../models/NutritionAgentState";
import { NutritionAgentStatuses } from "../models/NutritionAgentStatus";
import { freezeAgentState } from "../utils/FreezeNutritionState";

export class NutritionAgentSession {
  private state: NutritionAgentState;

  constructor(
    readonly id: string,
    clock: () => string = () => new Date().toISOString(),
  ) {
    this.state = freezeAgentState({
      sessionId: id,
      status: NutritionAgentStatuses.IDLE,
      requestId: null,
      contextId: null,
      decisionId: null,
      errorMessage: null,
      updatedAt: clock(),
    });
  }

  getState(): NutritionAgentState {
    return this.state;
  }

  transition(
    patch: Partial<Omit<NutritionAgentState, "sessionId">>,
    clock: () => string,
  ): NutritionAgentState {
    this.state = freezeAgentState({
      ...this.state,
      ...patch,
      sessionId: this.id,
      updatedAt: clock(),
    });
    return this.state;
  }
}

export { EMPTY_NUTRITION_AGENT_METADATA };
