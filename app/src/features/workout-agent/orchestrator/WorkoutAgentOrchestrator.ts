import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import {
  WorkoutAgentEngine,
  type WorkoutAgentEngineDeps,
} from "../agent/WorkoutAgentEngine";

/**
 * Orchestrator boundary — wires inbound runtime artifacts into the agent engine.
 * Does not call providers, build prompts, or execute tools.
 */
export class WorkoutAgentOrchestrator {
  private readonly engine: WorkoutAgentEngine;

  constructor(deps: WorkoutAgentEngineDeps = {}) {
    this.engine = new WorkoutAgentEngine(deps);
  }

  orchestrate(input: {
    readonly request: WorkoutRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): WorkoutAgentResult {
    return this.engine.processRequest(input);
  }

  getEngine(): WorkoutAgentEngine {
    return this.engine;
  }
}
