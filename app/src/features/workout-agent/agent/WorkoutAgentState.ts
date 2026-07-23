import type { WorkoutAgentState } from "../models/WorkoutAgentState";
import { WorkoutAgentSession } from "./WorkoutAgentSession";

/**
 * Thin state holder — orchestration only.
 */
export class WorkoutAgentStateManager {
  constructor(private readonly session: WorkoutAgentSession) {}

  current(): WorkoutAgentState {
    return this.session.getState();
  }

  update(
    patch: Partial<Omit<WorkoutAgentState, "sessionId">>,
    clock: () => string,
  ): WorkoutAgentState {
    return this.session.transition(patch, clock);
  }
}
