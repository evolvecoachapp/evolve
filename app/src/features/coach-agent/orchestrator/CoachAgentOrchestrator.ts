import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  CoachAgentEngine,
  type CoachAgentEngineDeps,
} from "../agent/CoachAgentEngine";
import type { CoachAgentResult } from "../models/CoachAgentResult";
import type { CoachRequest } from "../models/CoachRequest";

/**
 * Thin orchestrator boundary between service and engine.
 */
export class CoachAgentOrchestrator {
  private readonly engine: CoachAgentEngine;

  constructor(deps: CoachAgentEngineDeps = {}) {
    this.engine = new CoachAgentEngine(deps);
  }

  getEngine(): CoachAgentEngine {
    return this.engine;
  }

  orchestrate(input: {
    readonly request: CoachRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): CoachAgentResult {
    return this.engine.processRequest(input);
  }
}
