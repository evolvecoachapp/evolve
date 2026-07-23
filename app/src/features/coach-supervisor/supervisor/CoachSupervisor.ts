import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { CollaborationPort } from "../contracts/CollaborationPort";
import { createMockCollaborationPort } from "../contracts/CollaborationPort";
import type { RoutingPort } from "../contracts/RoutingPort";
import { createMockRoutingPort } from "../contracts/RoutingPort";
import type { CoachSupervisor as CoachSupervisorModel } from "../models/CoachSupervisor";
import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorResult } from "../models/CoachSupervisorResult";
import type { CoachSupervisorValidation } from "../models/CoachSupervisorValidation";
import {
  createCoachSupervisorFrameworkAgent,
  type CoachSupervisorFrameworkAgent,
} from "../framework/CoachSupervisorFrameworkAgent";
import {
  createCoachSupervisorEngine,
  type CoachSupervisorEngine,
  type CoachSupervisorEngineDeps,
} from "./CoachSupervisorEngine";

export interface CoachSupervisorFacadeDeps extends Partial<CoachSupervisorEngineDeps> {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Coach Supervisor facade — exposes engine + framework agent.
 */
export class CoachSupervisorFacade {
  private readonly engine: CoachSupervisorEngine;
  private readonly frameworkAgent: CoachSupervisorFrameworkAgent;

  constructor(deps: CoachSupervisorFacadeDeps = {}) {
    const routingPort: RoutingPort =
      deps.routingPort ?? createMockRoutingPort();
    const collaborationPort: CollaborationPort =
      deps.collaborationPort ?? createMockCollaborationPort();
    const clock = deps.clock ?? (() => new Date().toISOString());

    this.engine = createCoachSupervisorEngine({
      routingPort,
      collaborationPort,
      clock,
      supervisorId: deps.supervisorId,
    });

    this.frameworkAgent = createCoachSupervisorFrameworkAgent({
      supervisor: this.engine.describe(),
      clock,
    });

    if (deps.registerWithFramework && deps.frameworkService) {
      deps.frameworkService.registerAgent(this.frameworkAgent);
    }
  }

  getEngine(): CoachSupervisorEngine {
    return this.engine;
  }

  describe(): CoachSupervisorModel {
    return this.engine.describe();
  }

  asFrameworkAgent(): IAgent {
    return this.frameworkAgent;
  }

  registerWithFramework(frameworkService: AgentFrameworkService): void {
    frameworkService.registerAgent(this.frameworkAgent);
  }

  processCoachRequest(request: CoachSupervisorRequest): CoachSupervisorResult {
    return this.engine.processRequest(request);
  }

  buildCoordinationPlan(request: CoachSupervisorRequest): CoachSupervisorResult {
    return this.engine.buildPlan(request);
  }

  aggregateResults(input: {
    readonly plan: CoachSupervisorPlan;
    readonly summaries: readonly AgentExecutionSummary[];
  }): CoachSupervisorResult {
    return this.engine.aggregate(input);
  }

  validateSupervisorPlan(plan: CoachSupervisorPlan): CoachSupervisorValidation {
    return this.engine.validatePlan(plan);
  }
}

export function createCoachSupervisor(
  deps: CoachSupervisorFacadeDeps = {},
): CoachSupervisorFacade {
  return new CoachSupervisorFacade(deps);
}
