import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  RecoveryAgentEngine,
  type RecoveryAgentEngineDeps,
} from "../agent/RecoveryAgentEngine";
import type { RecoveryAgentResult } from "../models/RecoveryAgentResult";
import type { RecoveryRequest } from "../models/RecoveryRequest";

/**
 * Wires runtime artifacts into the Recovery Agent engine.
 * No AI. No providers. No tool execution.
 */
export class RecoveryAgentOrchestrator {
  private readonly engine: RecoveryAgentEngine;

  constructor(deps: RecoveryAgentEngineDeps = {}) {
    this.engine = new RecoveryAgentEngine(deps);
  }

  orchestrate(input: {
    readonly request: RecoveryRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): RecoveryAgentResult {
    return this.engine.processRequest(input);
  }
}
