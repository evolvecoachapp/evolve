import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { NutritionAgent } from "../models/NutritionAgent";
import {
  createNutritionFrameworkAgent,
  NutritionFrameworkAgent,
} from "../framework/NutritionFrameworkAgent";
import {
  NutritionAgentEngine,
  type NutritionAgentEngineDeps,
} from "./NutritionAgentEngine";

export interface NutritionAgentFacadeDeps extends NutritionAgentEngineDeps {
  /**
   * Optional Agent Framework service. When provided, the Nutrition Agent is
   * registered as an IAgent on construction (no processing behavior change).
   */
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Facade entry for the Nutrition Agent module.
 * Implements Agent Framework IAgent via NutritionFrameworkAgent adapter.
 */
export class NutritionAgentFacade {
  private readonly engine: NutritionAgentEngine;
  private readonly frameworkAgent: NutritionFrameworkAgent;
  private readonly clock: () => string;

  constructor(deps: NutritionAgentFacadeDeps = {}) {
    this.engine = new NutritionAgentEngine(deps);
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.frameworkAgent = createNutritionFrameworkAgent({
      nutritionAgent: this.engine.describe(),
      clock: this.clock,
    });

    if (deps.registerWithFramework && deps.frameworkService) {
      deps.frameworkService.registerAgent(this.asFrameworkAgent());
    }
  }

  describe(): NutritionAgent {
    return this.engine.describe();
  }

  getEngine(): NutritionAgentEngine {
    return this.engine;
  }

  /**
   * Agent Framework contract adapter (immutable registration surface).
   */
  asFrameworkAgent(): IAgent {
    return this.frameworkAgent;
  }
}

export { NutritionAgentEngine };
