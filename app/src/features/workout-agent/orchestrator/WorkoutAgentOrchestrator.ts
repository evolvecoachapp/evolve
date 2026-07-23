import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutDomainPayloads } from "../models/WorkoutDomainPayloads";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import {
  WorkoutAgentEngine,
  type WorkoutAgentEngineDeps,
} from "../agent/WorkoutAgentEngine";

/**
 * Orchestrator boundary — wires inbound runtime artifacts into the agent engine.
 * Selects planning strategy, delegates to Workout Domain via gateway when asked.
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

  async adapt(input: {
    readonly request: WorkoutRequest;
    readonly adaptationRequest: TrainingAdaptationRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
    readonly domainPayloads?: WorkoutDomainPayloads;
  }): Promise<WorkoutAgentResult> {
    return this.engine.adaptWorkout(input);
  }

  getEngine(): WorkoutAgentEngine {
    return this.engine;
  }
}
