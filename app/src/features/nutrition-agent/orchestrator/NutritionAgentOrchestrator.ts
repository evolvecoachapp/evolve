import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionAdjustMacrosRequest } from "../models/NutritionDomainPayloads";
import type { NutritionDomainPayloads } from "../models/NutritionDomainPayloads";
import type { NutritionRequest } from "../models/NutritionRequest";
import {
  NutritionAgentEngine,
  type NutritionAgentEngineDeps,
} from "../agent/NutritionAgentEngine";

/**
 * Orchestrator boundary — wires inbound runtime artifacts into the agent engine.
 * Does not call providers, build prompts, or execute tools.
 */
export class NutritionAgentOrchestrator {
  private readonly engine: NutritionAgentEngine;

  constructor(deps: NutritionAgentEngineDeps = {}) {
    this.engine = new NutritionAgentEngine(deps);
  }

  orchestrate(input: {
    readonly request: NutritionRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): NutritionAgentResult {
    return this.engine.processRequest(input);
  }

  adjust(input: {
    readonly request: NutritionRequest;
    readonly adjustMacrosRequest: NutritionAdjustMacrosRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: NutritionDomainPayloads;
  }): Promise<NutritionAgentResult> {
    return this.engine.adjustNutritionPlan(input);
  }

  getEngine(): NutritionAgentEngine {
    return this.engine;
  }
}
