import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  NutritionAgentFacade,
  NutritionAgentEngine,
  type NutritionAgentFacadeDeps,
} from "../agent/NutritionAgent";
import type { NutritionAgentEngineDeps } from "../agent/NutritionAgentEngine";
import type { NutritionAgent } from "../models/NutritionAgent";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionAdjustMacrosRequest } from "../models/NutritionDomainPayloads";
import type { NutritionDomainPayloads } from "../models/NutritionDomainPayloads";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionRequest } from "../models/NutritionRequest";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionAgentOrchestrator } from "../orchestrator/NutritionAgentOrchestrator";

export interface NutritionAgentServiceDeps extends NutritionAgentEngineDeps {
  readonly frameworkService?: AgentFrameworkService;
  readonly registerWithFramework?: boolean;
}

/**
 * Nutrition Agent Service — coordinates engine / orchestrator.
 *
 * Specialized framework agent: Agent Runtime → NutritionFrameworkAgent →
 * Nutrition Domain Gateway → Capability Selector → Nutrition Domain →
 * NutritionAgentResult.
 * No networking. No persistence. No provider SDKs. No prompt generation.
 */
export class NutritionAgentService {
  private readonly engine: NutritionAgentEngine;
  private readonly orchestrator: NutritionAgentOrchestrator;
  private readonly facade: NutritionAgentFacade;

  constructor(deps: NutritionAgentServiceDeps = {}) {
    const facadeDeps: NutritionAgentFacadeDeps = {
      ...deps,
      registerWithFramework: deps.registerWithFramework ?? false,
      frameworkService: deps.frameworkService,
    };
    this.facade = new NutritionAgentFacade(facadeDeps);
    this.engine = this.facade.getEngine();
    this.orchestrator = new NutritionAgentOrchestrator(deps);
  }

  describeCapabilities(): NutritionAgent {
    return this.engine.describe();
  }

  asFrameworkAgent(): IAgent {
    return this.facade.asFrameworkAgent();
  }

  registerWithFramework(frameworkService: AgentFrameworkService): void {
    frameworkService.registerAgent(this.asFrameworkAgent());
  }

  processNutritionRequest(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionAgentResult {
    return this.orchestrator.orchestrate(input);
  }

  buildNutritionPlan(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionPlan {
    return this.engine.buildPlan(input);
  }

  async adjustNutritionPlan(input: {
    readonly request: NutritionRequest;
    readonly adjustMacrosRequest: NutritionAdjustMacrosRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: NutritionDomainPayloads;
  }): Promise<NutritionAgentResult> {
    return this.orchestrator.adjust(input);
  }

  evaluateNutrition(plan: NutritionPlan): NutritionValidation {
    return this.engine.evaluate(plan);
  }

  validateNutritionPlan(plan: NutritionPlan): NutritionValidation {
    return this.engine.evaluate(plan);
  }
}

export function createNutritionAgentService(
  deps: NutritionAgentServiceDeps = {},
): NutritionAgentService {
  return new NutritionAgentService(deps);
}
