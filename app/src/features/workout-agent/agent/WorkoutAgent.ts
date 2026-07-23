import type { WorkoutAgent } from "../models/WorkoutAgent";
import {
  WorkoutAgentEngine,
  type WorkoutAgentEngineDeps,
} from "./WorkoutAgentEngine";

/**
 * Facade entry for the Workout Agent module.
 */
export class WorkoutAgentFacade {
  private readonly engine: WorkoutAgentEngine;

  constructor(deps: WorkoutAgentEngineDeps = {}) {
    this.engine = new WorkoutAgentEngine(deps);
  }

  describe(): WorkoutAgent {
    return this.engine.describe();
  }

  getEngine(): WorkoutAgentEngine {
    return this.engine;
  }
}

export { WorkoutAgentEngine };
