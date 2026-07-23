import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import {
  CoachAgentEngine,
  type CoachAgentEngineDeps,
} from "./CoachAgentEngine";
import {
  createCoachFrameworkAgent,
  type CoachFrameworkAgent,
} from "../framework/CoachFrameworkAgent";

export interface CoachAgentFacadeDeps extends CoachAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Facade wrapping CoachAgentEngine + optional framework registration.
 */
export class CoachAgentFacade {
  private readonly engine: CoachAgentEngine;
  private readonly frameworkAgent: CoachFrameworkAgent;

  constructor(deps: CoachAgentFacadeDeps = {}) {
    this.engine = new CoachAgentEngine(deps);
    this.frameworkAgent = createCoachFrameworkAgent({
      coachAgent: this.engine.describe(),
      clock: deps.clock,
    });
    if (deps.registerWithFramework && deps.frameworkService) {
      deps.frameworkService.registerAgent(this.frameworkAgent);
    }
  }

  getEngine(): CoachAgentEngine {
    return this.engine;
  }

  asFrameworkAgent(): IAgent {
    return this.frameworkAgent;
  }
}
