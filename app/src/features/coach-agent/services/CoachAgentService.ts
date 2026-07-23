import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  CoachAgentFacade,
  type CoachAgentFacadeDeps,
} from "../agent/CoachAgent";
import type { CoachAgentEngine } from "../agent/CoachAgentEngine";
import type { CoachAgentEngineDeps } from "../agent/CoachAgentEngine";
import type { CoachAgent } from "../models/CoachAgent";
import type { CoachAgentResult } from "../models/CoachAgentResult";
import type { CoachDecision } from "../models/CoachDecision";
import type { CoachEvaluation } from "../models/CoachValidation";
import type { CoachExecutionPlan } from "../models/CoachExecutionPlan";
import type { CoachRequest } from "../models/CoachRequest";
import type { CoachValidation } from "../models/CoachValidation";

export interface CoachAgentServiceDeps extends CoachAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Coach Agent Service — executes complete coach meta-agent flow.
 *
 * Agent Runtime → Coach Framework Agent → Agent Coordinator →
 * Workout / Recovery / Nutrition Agents → Merge → CoachAgentResult.
 *
 * No networking. No persistence. No provider SDKs. No prompts. No business logic.
 */
export class CoachAgentService {
  private readonly facade: CoachAgentFacade;
  private readonly engine: CoachAgentEngine;

  constructor(deps: CoachAgentServiceDeps = {}) {
    const facadeDeps: CoachAgentFacadeDeps = {
      ...deps,
      registerWithFramework: deps.registerWithFramework ?? false,
      frameworkService: deps.frameworkService,
    };
    this.facade = new CoachAgentFacade(facadeDeps);
    this.engine = this.facade.getEngine();
  }

  describeCapabilities(): CoachAgent {
    return this.engine.describe();
  }

  asFrameworkAgent(): IAgent {
    return this.facade.asFrameworkAgent();
  }

  registerWithFramework(frameworkService: AgentFrameworkService): void {
    frameworkService.registerAgent(this.asFrameworkAgent());
  }

  processCoachRequest(input: {
    readonly request: CoachRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): CoachAgentResult {
    return this.engine.processRequest(input);
  }

  buildCoachingPlan(request: CoachRequest): CoachExecutionPlan {
    return this.engine.buildPlan(request);
  }

  evaluateCoachDecision(input: {
    readonly decision: CoachDecision;
    readonly requestId?: string | null;
    readonly planId?: string | null;
  }): CoachEvaluation {
    return this.engine.evaluateDecision(input);
  }

  validateCoachPlan(plan: CoachExecutionPlan): CoachValidation {
    return this.engine.validatePlan(plan);
  }
}

export function createCoachAgentService(
  deps: CoachAgentServiceDeps = {},
): CoachAgentService {
  return new CoachAgentService(deps);
}
