import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { WorkoutAgent } from "../models/WorkoutAgent";
import {
  createWorkoutFrameworkAgent,
  WorkoutFrameworkAgent,
} from "../framework/WorkoutFrameworkAgent";
import {
  WorkoutAgentEngine,
  type WorkoutAgentEngineDeps,
} from "./WorkoutAgentEngine";

export interface WorkoutAgentFacadeDeps extends WorkoutAgentEngineDeps {
  /**
   * Optional Agent Framework service. When provided, the Workout Agent is
   * registered as an IAgent on construction (no processing behavior change).
   */
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Facade entry for the Workout Agent module.
 * Implements Agent Framework IAgent via WorkoutFrameworkAgent adapter.
 */
export class WorkoutAgentFacade {
  private readonly engine: WorkoutAgentEngine;
  private readonly frameworkAgent: WorkoutFrameworkAgent;
  private readonly clock: () => string;

  constructor(deps: WorkoutAgentFacadeDeps = {}) {
    this.engine = new WorkoutAgentEngine(deps);
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.frameworkAgent = createWorkoutFrameworkAgent({
      workoutAgent: this.engine.describe(),
      clock: this.clock,
    });

    if (deps.registerWithFramework && deps.frameworkService) {
      deps.frameworkService.registerAgent(this.asFrameworkAgent());
    }
  }

  describe(): WorkoutAgent {
    return this.engine.describe();
  }

  getEngine(): WorkoutAgentEngine {
    return this.engine;
  }

  /**
   * Agent Framework contract adapter (immutable registration surface).
   */
  asFrameworkAgent(): IAgent {
    return this.frameworkAgent;
  }
}

export { WorkoutAgentEngine };
