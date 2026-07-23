import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { RecoveryAgent } from "../models/RecoveryAgent";
import {
  createRecoveryFrameworkAgent,
  RecoveryFrameworkAgent,
} from "../framework/RecoveryFrameworkAgent";
import {
  RecoveryAgentEngine,
  type RecoveryAgentEngineDeps,
} from "./RecoveryAgentEngine";

export interface RecoveryAgentFacadeDeps extends RecoveryAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Facade entry for the Recovery Agent module.
 * Implements Agent Framework IAgent via RecoveryFrameworkAgent adapter.
 */
export class RecoveryAgentFacade {
  private readonly engine: RecoveryAgentEngine;
  private readonly frameworkAgent: RecoveryFrameworkAgent;
  private readonly clock: () => string;

  constructor(deps: RecoveryAgentFacadeDeps = {}) {
    this.engine = new RecoveryAgentEngine(deps);
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.frameworkAgent = createRecoveryFrameworkAgent({
      recoveryAgent: this.engine.describe(),
      clock: this.clock,
    });

    if (deps.registerWithFramework && deps.frameworkService) {
      deps.frameworkService.registerAgent(this.asFrameworkAgent());
    }
  }

  describe(): RecoveryAgent {
    return this.engine.describe();
  }

  getEngine(): RecoveryAgentEngine {
    return this.engine;
  }

  asFrameworkAgent(): IAgent {
    return this.frameworkAgent;
  }
}

export { RecoveryAgentEngine };
