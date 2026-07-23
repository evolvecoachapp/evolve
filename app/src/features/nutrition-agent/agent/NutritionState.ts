import type { NutritionAgentState } from "../models/NutritionAgentState";
import { NutritionAgentSession } from "./NutritionSession";

/**
 * Thin state holder — orchestration only.
 */
export class NutritionAgentStateManager {
  constructor(private readonly session: NutritionAgentSession) {}

  current(): NutritionAgentState {
    return this.session.getState();
  }

  update(
    patch: Partial<Omit<NutritionAgentState, "sessionId">>,
    clock: () => string,
  ): NutritionAgentState {
    return this.session.transition(patch, clock);
  }
}
