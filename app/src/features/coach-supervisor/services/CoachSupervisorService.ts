import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { CollaborationPort } from "../contracts/CollaborationPort";
import type { RoutingPort } from "../contracts/RoutingPort";
import type { CoachSupervisor } from "../models/CoachSupervisor";
import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorResult } from "../models/CoachSupervisorResult";
import type { CoachSupervisorValidation } from "../models/CoachSupervisorValidation";
import {
  CoachSupervisorFacade,
  type CoachSupervisorFacadeDeps,
} from "../supervisor/CoachSupervisor";

export interface CoachSupervisorServiceDeps extends CoachSupervisorFacadeDeps {
  readonly routingPort?: RoutingPort;
  readonly collaborationPort?: CollaborationPort;
  readonly clock?: () => string;
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Coach Supervisor Service — central orchestration facade.
 *
 * User Request → Coach Supervisor → Routing → Capability Registry →
 * Agent Collaboration → Specialists → Aggregation → UnifiedCoachResponse
 *
 * No networking. No persistence. No provider SDKs. No prompts. No business logic.
 */
export class CoachSupervisorService {
  private readonly facade: CoachSupervisorFacade;

  constructor(deps: CoachSupervisorServiceDeps = {}) {
    this.facade = new CoachSupervisorFacade({
      ...deps,
      registerWithFramework: deps.registerWithFramework ?? false,
    });
  }

  describeCapabilities(): CoachSupervisor {
    return this.facade.describe();
  }

  asFrameworkAgent(): IAgent {
    return this.facade.asFrameworkAgent();
  }

  registerWithFramework(frameworkService: AgentFrameworkService): void {
    this.facade.registerWithFramework(frameworkService);
  }

  processCoachRequest(request: CoachSupervisorRequest): CoachSupervisorResult {
    return this.facade.processCoachRequest(request);
  }

  buildCoordinationPlan(request: CoachSupervisorRequest): CoachSupervisorResult {
    return this.facade.buildCoordinationPlan(request);
  }

  aggregateResults(input: {
    readonly plan: CoachSupervisorPlan;
    readonly summaries: readonly AgentExecutionSummary[];
  }): CoachSupervisorResult {
    return this.facade.aggregateResults(input);
  }

  validateSupervisorPlan(plan: CoachSupervisorPlan): CoachSupervisorValidation {
    return this.facade.validateSupervisorPlan(plan);
  }
}

export function createCoachSupervisorService(
  deps: CoachSupervisorServiceDeps = {},
): CoachSupervisorService {
  return new CoachSupervisorService(deps);
}
