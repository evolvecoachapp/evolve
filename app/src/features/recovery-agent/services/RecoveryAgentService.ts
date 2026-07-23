import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  RecoveryAgentFacade,
  RecoveryAgentEngine,
  type RecoveryAgentFacadeDeps,
} from "../agent/RecoveryAgent";
import type { RecoveryAgentEngineDeps } from "../agent/RecoveryAgentEngine";
import type { RecoveryAgent } from "../models/RecoveryAgent";
import type { RecoveryAgentResult } from "../models/RecoveryAgentResult";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryAgentOrchestrator } from "../orchestrator/RecoveryAgentOrchestrator";

export interface RecoveryAgentServiceDeps extends RecoveryAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Recovery Agent Service — coordinates engine / orchestrator.
 *
 * Implements Agent Framework IAgent adapter. Processing behavior is
 * orchestration-only. No networking. No persistence. No provider SDKs.
 */
export class RecoveryAgentService {
  private readonly engine: RecoveryAgentEngine;
  private readonly orchestrator: RecoveryAgentOrchestrator;
  private readonly facade: RecoveryAgentFacade;

  constructor(deps: RecoveryAgentServiceDeps = {}) {
    const facadeDeps: RecoveryAgentFacadeDeps = {
      ...deps,
      registerWithFramework: deps.registerWithFramework ?? false,
      frameworkService: deps.frameworkService,
    };
    this.facade = new RecoveryAgentFacade(facadeDeps);
    this.engine = this.facade.getEngine();
    this.orchestrator = new RecoveryAgentOrchestrator(deps);
  }

  describeCapabilities(): RecoveryAgent {
    return this.engine.describe();
  }

  asFrameworkAgent(): IAgent {
    return this.facade.asFrameworkAgent();
  }

  registerWithFramework(frameworkService: AgentFrameworkService): void {
    frameworkService.registerAgent(this.asFrameworkAgent());
  }

  processRecoveryRequest(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryAgentResult {
    return this.orchestrator.orchestrate(input);
  }

  buildRecoveryPlan(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryPlan {
    return this.engine.buildPlan(input);
  }

  evaluateRecovery(plan: RecoveryPlan): RecoveryValidation {
    return this.engine.evaluate(plan);
  }

  validateRecoveryPlan(plan: RecoveryPlan): RecoveryValidation {
    return this.engine.evaluate(plan);
  }
}

export function createRecoveryAgentService(
  deps: RecoveryAgentServiceDeps = {},
): RecoveryAgentService {
  return new RecoveryAgentService(deps);
}
